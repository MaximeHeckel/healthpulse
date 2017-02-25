#HealthPulse

HealthPulse is a small iOS app, built with React Native, that pushes data from HealthKit to a desired endpoint.


##Why?

I felt that Apple lacked of a web API for HealthKit and I wanted to use my HealthKit data that was "trapped" in my iPhone, so I built my own API
(which uses GraphQL) with my own health dashboard (see https://health.maximeheckel.com and https://github.com/MaximeHeckel/health-dashboard).
This app basically allowed me to have a "bridge" between HealthKit and my API, and I thought that maybe other people would find it useful.

I've improved it and used it for several months now and it helped me gathered a significant amount of data from my Apple Watch.

##Installation

1. Run it on your iOS device.

- Clone the project (I might end up doing proper releases on Github)
- Run `react-native bundle`
- Open `/ios/healthPulse.xcodeproj`
- In `appDelegate.m` copy and paste/replace the following lines to update the jsCodeLocation variable:

```
//jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
```

- Build and run the app (you might need a Apple Developer account to run it on a physical iOS device)

2. Contribute to the project

- Clone the project
- Inside the project folder, run `npm install` to install react-native and all the dependencies required for the project to run
- Run `npm start`

##Usage

I tried to make this app as simple as possible, in order to use it you just need to put your API endpoint on the first field, credentials for basic auth (if your server requires it) on the two following field and press and press the **Push data** button.
If you let the app running on the background it will push your data against the endpoint you've set automatically (I used iOS Background Fetch for this, [learn more here](https://developer.apple.com/library/content/documentation/iPhone/Conceptual/iPhoneOSProgrammingGuide/BackgroundExecution/BackgroundExecution.html)).
If you're looking for a server example: [https://github.com/MaximeHeckel/health-dashboard/tree/master/go/src/server](https://github.com/MaximeHeckel/health-dashboard/tree/master/go/src/server).


####Payload

The folowing JSON object is a sample payload that the app sends:

```
{
	"date":"20170224",
	"heartRate":
		[{
			"value":72, 
			"startDate":"2017-02-24T18:58:26.947-0800",
			"endDate":"2017-02-24T18:58:26.947-0800"
		},
		...
		],
	"stepCountSamples":
		[{
			"value":34, 
			"startDate":"2017-02-24T18:58:26.947-0800",
			"endDate":"2017-02-24T18:58:26.947-0800"
		},
		...
		],
	"sleepAnalysus":
		[{
			"value":"INBED", 
			"startDate":"2017-02-24T18:58:26.947-0800",
			"endDate":"2017-02-24T18:58:26.947-0800"
		},
		...
		],
	"stepCount": {
		"value": 1000,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	},
	"cyclineDistance": {
		"value": 1000,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	},
	"walkinRunningDistance": {
		"value": 1000,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	},
	"weight": {
		"value": 7000,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	},
	"bodyfatpercentage": {
		"value": 12,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	},
	"bmi": {
		"value": 22,
		"startDate":"2017-02-24T18:58:26.947-0800",
		"endDate":"2017-02-24T18:58:26.947-0800"
	}
}

```

##Limitations

It doesn't look like it's possible to have access to the data from HealthKit, when the phone is locked, thus the background push will only work while you're using the phone.