import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  
  useEffect(() => {
  let subscriber: Location.LocationSubscription;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location denied");
      return;
    }

    subscriber = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      async (loc) => {
        setLocation(loc.coords);

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=83b973fd2dcfd6aa448d9b4bb9a6209c&units=metric`
        );
        const weatherData = await weatherRes.json();
        const { temp } = weatherData.main;
        const description = weatherData.weather[0].description;
        setWeather(`${temp}°C, ${description}`);
        console.log(weatherData)
        
      }
    );
  })();


  return () => subscriber?.remove();
}, []);

  const text = errorMsg
    ? errorMsg
    : location
    ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`
    : "Loading location...";

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        </MapView>
      )}

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>{text}</Text>
        <Text style={styles.overlayText}>{weather ?? "Loading weather..."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#AA000000",
    padding: 10,
    borderRadius: 6,
  },
  overlayText: {
    color: "rgba(0, 0, 0, 0.6)",
    marginBottom: 4,
  },
});
