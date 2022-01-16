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
    //console.log("duration_ms :" + duration_ms);
    //console.log("busDateTime: " + busDateTime);

    var arrivalTime = new Date(busDateTime).toLocaleTimeString();
    var minute = 0;
    var second = 0;

    var returnText = "";

    if (duration_ms == null)
    {
      returnText = "NA";
    }
    else if (duration_ms < 0)
    {
      returnText = "(now)";
    }
    else {
      minute = Math.floor(duration_ms / 60000);
      second = ((duration_ms % 60000) / 1000).toFixed(0);

      //console.log("minute: " + minute);
      //console.log("sec: " + second);

      returnText = "(" + (second == 60 ? (minute + 1) + " min " : minute + " min " + (second < 10 ? "0" : "") + second) + " sec)";
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

          var x = getArrivalTimeAndDuration(myBus.next.time, myBus.next.duration_ms);
          var y = getArrivalTimeAndDuration(myBus.next2.time, myBus.next2.duration_ms);

          setArrival(x);
          setNextArrival(y);
        }

        setLoading(false);
      });
  }

  {/* auto refresh every 1 minutes */}
  useEffect(() => {
    const interval = setInterval(loadBusStopData, 60000);
    
    //Return the function to run when unmounting
    return() => clearInterval(interval);
  }, [] );
  

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Bus No: {BusNo}</Text>
      <Text style={styles.titleText}>Bus Stop: {BusStop}</Text>
      <Text style={styles.titleText}>Arrival Time: </Text>
      <Text style={styles.arrivalText}>{loading ? <ActivityIndicator color="blue" size="large" /> : arrival}</Text>
      <Text style={[styles.titleText, {fontSize:25}]}>Next Arrival: </Text>
      <Text style={styles.nextArrivalText}>{loading ? <ActivityIndicator color="blue" size="large" /> : nextArrival}</Text>
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
