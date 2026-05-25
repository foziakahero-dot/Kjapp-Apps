export default {
  expo: {
    name: "KJAPP Pilot",
    slug: "kjapp-pilot-mobile",
    scheme: "kjapp",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    platforms: ["ios", "android", "web"],
    ios: { bundleIdentifier: "no.kjapp.pilot", supportsTablet: false },
    android: { package: "no.kjapp.pilot" },
    plugins: ["expo-router"]
  }
};
