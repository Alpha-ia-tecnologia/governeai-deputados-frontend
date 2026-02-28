module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Adicionar suporte para Expo Router
      'expo-router/babel',
    ],
  };
};
