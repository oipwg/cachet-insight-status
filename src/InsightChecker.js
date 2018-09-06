import { Insight } from 'insight-explorer'

const COMPONENT_STATUSES = {
	Operational: 1,
	PerformanceIssues: 2,
	PartialOutage: 3,
	MajorOutage: 4
}

const INCIDENT_STATUSES = {
	Scheduled: 0,
	Investigating: 1,
	Identified: 2,
	Watching: 3,
	Fixed: 4
}

const INCIDENT_STATUS_TO_COMPONENT_STATUS = {
	"1": COMPONENT_STATUSES.MajorOutage,
	"2": COMPONENT_STATUSES.PartialOutage,
	"3": COMPONENT_STATUSES.PartialOutage,
	"4": COMPONENT_STATUSES.Operational
}

let getDateString = () => {
	let date = new Date()
	return date.toDateString() + " " + date.toLocaleTimeString()
}

export default class InsightChecker {
	/**
	 * Create a new InsightChecker
	 * @param  {Object} options - Options for the InsightChecker
	 * @param {CachetAPI} options.cachet - The CachetAPI instance to use to update statuses
	 * @param {String} options.api - The Insight API url
	 * @param {String} options.name - The Human Name of the Insight server
	 * @param {Integer} options.component_id - The Component ID (in Cachet) for the insight service
	 * @param {Integer} options.blocks_offline_after - The number of seconds after which the blocks will be considered to be not syncing
	 * @param {Integer} options.check_interval - The interval (in seconds) to update Cachet with the latest status.
	 */
	constructor(options){
		this._cachet = options.cachet
		this._insight = new Insight(options.url, false)

		this._name = options.name
		this._component_id = options.component_id
		this._blocks_offline_after = options.blocks_offline_after
		this._check_interval = options.check_interval

		if (this._check_interval){
			this.check_interval_timer = setInterval(this.runUpdateCycle.bind(this), this._check_interval * 1000)

			this.runUpdateCycle()
		}
	}
	async runUpdateCycle(){
		let status

		try {
			status = await this.checkStatus()
		} catch (e){
			console.warn(getDateString() + " | " + this._name + " | Unable to check status! \n" + e)
		}

		if (status){
			try {
				await this.updateStatus(status)

				console.log(getDateString() + " | " + this._name + " | " + status)
			} catch(e){
				console.warn(getDateString() + " | " + this._name + " | Unable to update status! \n" + e)
			}
		} else {
			console.warn(getDateString() + " | " + this._name + " | No status!")
		}

		return
	}
	async checkStatus(){
		let current_date = new Date()

		let current_year = current_date.getFullYear()
		// Add one because date months start at 0 (i.e., January is 0)
		let current_month = current_date.getMonth() + 1
		let current_day = current_date.getDate()

		// Add on a starting 0 if we are less than 10
		if (current_month < 10)
			current_month = "0" + current_month.toString()

		// Add on a starting 0 if we are less than 10
		if (current_day < 10)
			current_day = "0" + current_day.toString()

		let date_string = `${current_year}-${current_month}-${current_day}`

		let blocks

		try {
			blocks = await this._insight.getBlockSummary(1, date_string)
		} catch (e) {
			// If there is an error getting the block summary, the service is offline.
			return "offline"
		}

		// If no blocks have synced today, show offline.
		if (!blocks.blocks[0])
			return "blocks_offline"

		let last_block_timestamp = blocks.blocks[0].time
		let current_timestamp = parseInt(current_date.getTime() / 1000)

		// Check if the blocks have stopped syncing
		if (current_timestamp - last_block_timestamp >= this._blocks_offline_after)
			return "blocks_offline"

		return "online"
	}
	async updateStatus(status){
		if (status === "online"){
			return await this.updateIncident(INCIDENT_STATUSES.Fixed, {
				name: "Server Online",
				message: "Server is now operational and should respond to API requests."
			})
		}

		if (status === "offline"){
			return await this.updateIncident(INCIDENT_STATUSES.Investigating, {
				name: "Unable to reach Server",
				message: "Unable to reach Server!\n\nThe following services for this API may be offline: \n     - Address Balance Lookup\n     - Sending Transactions\n     - Recieving Transactions",
			})
		}

		if (status === "blocks_offline"){
			return await this.updateIncident(INCIDENT_STATUSES.Watching, {
				name: "New Blocks not Downloading",
				message: "No new Blocks have been recieved by the server recently! \n The following services for this API may be offline: \n 	- Address Balance Lookup\n 	- Sending Transactions\n 	- Recieving Transactions",
			})
		}

		return false
	}
	async updateComponent(new_status) {
		let component = await this._cachet.getComponent(this._component_id)

		if (component.status !== new_status){
			await this._cachet.updateComponent(this._component_id, {
				status: new_status,
				enabled: 1
			})

			console.log(getDateString() + " | " + this._name + " | Updated Component Status!")
		}

		return true
	}
	async updateIncident(new_status, incident) {
		let incidents
		try {
			incidents = await this._cachet.getIncidents()
		} catch (e) {
			throw new Error("Unable to get Incidents for Insight! \n" + e)
		}

		let matched_incident

		// See if there is an incident that is currently open and matches our component
		for (let incident of incidents){
			if (incident.component_id === this._component_id && incident.status !== INCIDENT_STATUSES.Fixed)
				matched_incident = incident
		}

		if (matched_incident){
			// Check if there are updates
			if (matched_incident.updates && matched_incident.updates.length >= 1){
				// Check the first update in the array (the latest, since Cachet orders them weird...)
				// to see if it matches the new incident message we want to add
				if (matched_incident.updates[0].message === incident.message || (matched_incident.updates[0].message.indexOf("No new Blocks") != -1 && incident.message.indexOf("No new Blocks") != -1) || (matched_incident.updates[0].message.indexOf("Unable to reach Server") != -1 && incident.message.indexOf("Unable to reach Server") != -1)){
					// If it is, then we will just update the component then return false
					await this.updateComponent(INCIDENT_STATUS_TO_COMPONENT_STATUS[new_status])
					return false
				}
			} 
			// Else, if there are no updates, check to see if the main incident matches the new update wanting to be sent
			else if (matched_incident.message === incident.message && matched_incident.name === incident.name && matched_incident.status === new_status){
				// Looks like we do match, so return after updating the component
				await this.updateComponent(INCIDENT_STATUS_TO_COMPONENT_STATUS[new_status])
				return false
			}

			// If we aren't the same as the last update, then add an update :)
			await this._cachet.addIncidentUpdate(matched_incident.id, {
				message: incident.message,
				status: new_status
			})

			console.log(getDateString() + " | " + this._name + " | Added an Incident Update!")

			// Make sure the component has the latest status
			await this.updateComponent(INCIDENT_STATUS_TO_COMPONENT_STATUS[new_status])

			return true
		} else {
			// If we didn't match to an incident, and we aren't broken, just return
			if (new_status === INCIDENT_STATUSES.Fixed){
				// Make sure the component has the latest status (aka, resolves itself)
				await this.updateComponent(INCIDENT_STATUS_TO_COMPONENT_STATUS[new_status])
				return false
			}

			// Since we didn't match, add a new incident!
			await this._cachet.addIncident({
				name: incident.name,
				message: incident.message,
				status: new_status,
				visible: 1,
				component_id: this._component_id,
				component_status: INCIDENT_STATUS_TO_COMPONENT_STATUS[new_status]
			})

			console.log(getDateString() + " | " + this._name + " | Added a new Incident!")

			return true
		}
	}
}





