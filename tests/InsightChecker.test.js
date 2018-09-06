import CachetAPI from '@ostlerdev/cachetapi'
import InsightChecker from '../src/InsightChecker'

describe("InsightChecker", () => {
	// test("Check Status", async () => {
	// 	let insight = new InsightChecker({
	// 		cachet: new CachetAPI({
	// 			url: "https://status.alexandria.io/api",
	// 			apiToken: "I0DqR9tY78T791tViboh"
	// 		}),
	// 		url: "https://flosight.failover.alexandria.io/api",
	// 		blocks_offline_after: 1 * 60,
	// 		component_id: 2
	// 	})

	// 	let status = await insight.checkStatus()

	// 	console.log(status)

	// 	expect(status).toBe("offline")

	// 	let updated = await insight.updateStatus()

	// 	console.log(updated)
	// })
	test("Update Status", async () => {
		let insight = new InsightChecker({
			cachet: new CachetAPI({
				url: "https://status.alexandria.io/api",
				apiToken: "I0DqR9tY78T791tViboh"
			}),
			url: "https://flosight.failover.alexandria.io/api",
			blocks_offline_after: 60 * 60,
			component_id: 2
		})

		let status = await insight.checkStatus()

		let updated = await insight.updateStatus(status)

		expect(updated).toBeDefined()
	}, 10000)
})