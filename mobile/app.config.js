module.exports = ({ config }) => {
  const mapsKey = process.env.EXPO_PUBLIC_MAPS_API_KEY || "";
  const plugins = config.plugins || [];

  return {
    ...config,
    plugins: [
      ...plugins,
      ...(mapsKey
        ? [["react-native-maps", { androidGoogleMapsApiKey: mapsKey }]]
        : []),
    ],
  };
};
