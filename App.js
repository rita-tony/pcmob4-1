import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  //const BUSSTOP_URL = "https://arrivelah2.busrouter.sg/?id=65141";
  const BusStop = "65141";
  const BUSSTOP_URL = "https://arrivelah2.busrouter.sg/?id=" + BusStop;
  const BusNo = "118";

  const [loading, setLoading] = useState(true);
  const [arrival, setArrival] = useState("");
  const [nextArrival, setNextArrival] = useState("");

  function getArrivalTimeAndDuration(busDateTime, duration_ms) {
    let arrivalTime = new Date(busDateTime).toLocaleTimeString();
    let minute = "";
    let returnText = "";

    if (duration_ms == null)
    {
      minute = "NA";
      returnText = "NA";
    }
    else {
      minute = (duration_ms / 60000).toFixed(0);

      if (minute > 0)
        returnText = "(" + minute + " mins)";
      else
        returnText = "(now)";
    }

    returnText = arrivalTime + " " + returnText;

    return returnText;
  }

  function loadBusStopData() {
    setLoading(true);

    fetch(BUSSTOP_URL)
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        const myBus = responseData.services.filter(
          (bus) => bus.no === BusNo
        )[0];

        if (myBus == null) {
          setArrival("no service");
          setNextArrival("NA");
        }
        else {
          //console.log("My Bus " + BusNo);
          //console.log(myBus);

          let x = getArrivalTimeAndDuration(myBus.next.time, myBus.next.duration_ms);
          let y = getArrivalTimeAndDuration(myBus.next2.time, myBus.next2.duration_ms);
          //console.log("arrival time : " + x);
          //console.log("next arrival time : " + y);

          setArrival(x);
          setNextArrival(y);
        }

        setLoading(false);
      });
  }

  {/* auto refresh every 5 minutes */}
  useEffect(() => {
    const interval = setInterval(loadBusStopData, 250000);
    
    //Return the function to run when unmounting
    return() => clearInterval(interval);
  }, [] );
  

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Bus No: {BusNo}</Text>
      <Text style={styles.titleText}>Bus Stop: {BusStop}</Text>
      <Text style={styles.titleText}>Arrival Time: </Text>
      <Text style={styles.arrivalText}>{loading ? <ActivityIndicator color="blue" size="large" /> : arrival}</Text>
      <Text style={styles.nextArrivalText}>Next Arrival: {loading ? <ActivityIndicator color="blue" size="large" /> : nextArrival}</Text>
      <TouchableOpacity style={styles.button} onPress={loadBusStopData}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 30,
    margin: 10,
    fontWeight: "800",
  },
  arrivalText: {
    fontSize: 30,
    margin: 10,
  },
  nextArrivalText: {
    fontSize: 20,
    margin: 10,
  },
  button: {
    backgroundColor: "green",
    borderRadius: 10,
    padding: 20,
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
});
