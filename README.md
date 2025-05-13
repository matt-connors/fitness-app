# Fitness App
This directed study project aims to develop a comprehensive fitness application for iOS and Android platforms. The app will focus on providing users with the tools to log exercises, create and manage workout routines, and track their progress over time. It will leverage advanced technologies like React Native, GraphQL, and Cloudflare to deliver a seamless and efficient user experience. The app will also explore the potential of AI to enhance user engagement and personalization, including features like exercise recommendations and recovery analysis.

## Working With the Codebase

In order to efficiently, build, test, manage, and update the app, Expo is used in compliment with React Native. Since IOS development on Windows is not reasonably feasible (by Apple's intentions), Expo EAS is used for building the app in the cloud and deploying to the App store.

### Local Development

Run `npx expo start` to start a local development server that automatically listens for changes. Press the `s` key to switch to Expo Go (the app) in order to preview the app on a physical device.
* This local development server has other options for running locally in a browser and on Android devices.

See https://docs.expo.dev/tutorial/create-your-first-app/ for more info regarding "hello world" setup

### Build
TODO: This is not needed until we want to use our app standalone, without using Expo Go.
- https://docs.expo.dev/build-reference/simulators/#installing-build-on-the-simulator
- https://docs.expo.dev/build/setup/