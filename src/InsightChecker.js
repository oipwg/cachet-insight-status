import { Insight } from 'insight-explorer'

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
		this._blocks_offline_after = options.blocks_online_after
		this._check_interval
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
			console.log(e)
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
	async updateStatus(){
		
	}
}