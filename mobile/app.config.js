module.exports = ({ config }) => {
  const mapsKey = process.env.EXPO_PUBLIC_MAPS_API_KEY || "";
  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: { apiKey: mapsKey },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: mapsKey,
      },
    },
  };
};
