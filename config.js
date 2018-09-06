module.exports = {
	"check_interval": 60,
	"cachet": {
		"url": "https://demo.cachethq.io/api",
		"apiToken": "9yMHsdioQosnyVK4iCVR"
	},
	"insights": [
		{
			"name": "Alexandria Bitcoin (Livenet)",
			"component_id": 26,
			"url": "https://bitsight.failover.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Alexandria Bitcoin (Testnet)",
			"component_id": 27,
			"url": "https://bitsight.mk1.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Alexandria Litecoin (Livenet)",
			"component_id": 24,
			"url": "https://litesight.failover.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Alexandria Litecoin (Testnet)",
			"component_id": 25,
			"url": "https://litesight.mk1.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Alexandria Flo (Livenet)",
			"component_id": 2,
			"url": "https://flosight.failover.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Alexandria Flo (Testnet)",
			"component_id": 1,
			"url": "https://flosight.mk1.alexandria.io/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Flocha.in (Livenet)",
			"component_id": 22,
			"url": "https://livenet.flocha.in/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		},
		{
			"name": "Flocha.in (Testnet)",
			"component_id": 23,
			"url": "https://testnet.flocha.in/api",
			// 3600 = 60 minutes * 60 seconds = one hour
			"blocks_offline_after": 3600
		}
	]
}
