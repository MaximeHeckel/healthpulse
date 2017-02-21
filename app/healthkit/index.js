import AppleHealthKit from 'react-native-apple-healthkit';

// setup the HealthKit initialization options
const HKPERMS = AppleHealthKit.Constants.Permissions;

const HKOPTIONS = {
  permissions: {
    read:  [
      HKPERMS.DistanceWalkingRunning,
      HKPERMS.DistanceCycling,
      HKPERMS.BasalEnergyBurned,
      HKPERMS.ActiveEnergyBurned,
      HKPERMS.AppleExerciseTime,
      HKPERMS.StepCount,
      HKPERMS.HeartRate,
      HKPERMS.SleepAnalysis,
      HKPERMS.Weight,
      HKPERMS.BodyFatPercentage,
      HKPERMS.BodyMassIndex,
    ],
  }
};

module.exports = {
  HKOPTIONS,
}

