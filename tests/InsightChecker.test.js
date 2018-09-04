import CachetAPI from '@ostlerdev/cachetapi'
import InsightChecker from '../src/InsightChecker'

describe("InsightChecker", () => {
	test("Check Status", async () => {
		let insight = new InsightChecker({
			cachet: new CachetAPI({
				url: "https://demo.cachethq.io/api",
				apiToken: "9yMHsdioQosnyVK4iCVR"
			}),
			url: "https://flosight.failover.alexandria.io/api",
			blocks_online_after: 1 * 60
		})

		let status = await insight.checkStatus()

		console.log(status)

		expect(status).toBe("offline")
	})
	test("Check Status", async () => {
		let insight = new InsightChecker({
			cachet: new CachetAPI({
				url: "https://demo.cachethq.io/api",
				apiToken: "9yMHsdioQosnyVK4iCVR"
			}),
			url: "https://bitsight.mk1.alexandria.io/api"
		})

		let status = await insight.checkStatus()

		console.log(status)
		
		expect(status).toBe("blocks_offline")
	})
})