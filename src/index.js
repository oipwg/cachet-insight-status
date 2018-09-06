import CachetAPI from '@ostlerdev/cachetapi'
import InsightChecker from './InsightChecker'

const config = require('../config.js')

let cachet = new CachetAPI(config.cachet)

let insight_checkers = []

for (let insight of config.insights){
	let insight_checker = new InsightChecker({
		...insight,
		cachet: cachet,
		check_interval: config.check_interval
	})
	insight_checkers.push(insight_checker)
}