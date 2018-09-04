import CachetAPI from '@ostlerdev/cachetapi'
import InsightChecker from './InsightChecker'

const config = require('../config.json')

let cachet = new CachetAPI(config.cachet)

let insight_checkers = []

for (let insight of config.insights){
	insight_checkers.push(new InsightChecker({
		...insight,
		cachet: cachet
	}))
}