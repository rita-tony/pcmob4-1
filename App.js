import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';


function HomeScreen({ navigation }) {
  const [busStopNo, setBusStopNo] = useState("");
  const [busNo, setBusNo] = useState("");
  const [isLoadBusStopData, setIsLoadBusStopData] = useState(true);

  function clearFields() {
    setBusStopNo("");
    setBusNo("");
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={{ fontSize: 30, fontWeight: "800" }}>Check SG Bus</Text>
        <Text style={{ fontSize: 30, fontWeight: "800", marginBottom: 50 }}>Arrival Time App</Text>
        <Text style={styles.labelTextStyle}>Bus Stop No:</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder='example: 65141'
          maxLength={10}
          value={busStopNo}
          onChangeText={(txtBusStopNo) => setBusStopNo(txtBusStopNo)}
          keyboardType="numeric"
        >
        </TextInput>
        <Text style={styles.labelTextStyle}>Bus No:</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder='example: 118'
          maxLength={10}
          value={busNo}
          onChangeText={(txtBusNo) => setBusNo(txtBusNo)}
          keyboardType="numeric"
        >
        </TextInput>

        <View style={styles.buttonsStyle}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Bus Arrival Info", { busStopNo, busNo, isLoadBusStopData })}
            style={[styles.buttonStyle, styles.submitButtonStyle]}
          >
            <Text style={styles.buttonTextStyle}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearFields}
            style={[styles.buttonStyle, styles.cancelButtonStyle]}
          >
            <Text style={styles.buttonTextStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

function DetailScreen({ route }) {
  const BusStop = route.params?.busStopNo;
  const BUSSTOP_URL = "https://arrivelah2.busrouter.sg/?id=" + BusStop;
  const BusNo = route.params?.busNo;

  const [isLoadBusStopData, setIsLoadBusStopData] = useState(route.params?.isLoadBusStopData);
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

    if (duration_ms == null) {
      returnText = "NA";
    }
    else if (duration_ms < 0) {
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

  {/* auto refresh every 1 minutes */ }
  useEffect(() => {
    const interval = setInterval(loadBusStopData, 60000);

    //Return the function to run when unmounting
    return () => clearInterval(interval);
  }, []);

  {/* run only when the screen is loaded */}
  useEffect(() => {
    if (isLoadBusStopData) {
      console.log("run 1 time only");
      loadBusStopData();
      setIsLoadBusStopData(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Bus No: {BusNo}</Text>
      <Text style={styles.titleText}>Bus Stop: {BusStop}</Text>
      <Text style={styles.titleText}>Arrival Time: </Text>
      <Text style={styles.arrivalText}>{loading ? <ActivityIndicator color="blue" size="large" /> : arrival}</Text>
      <Text style={[styles.titleText, { fontSize: 25 }]}>Next Arrival: </Text>
      <Text style={styles.nextArrivalText}>{loading ? <ActivityIndicator color="blue" size="large" /> : nextArrival}</Text>
      <TouchableOpacity style={styles.button} onPress={loadBusStopData}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Bus Arrival Info" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
    fontSize: 28,
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

  textInputStyle: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    width: '80%',
    padding: 10,
    borderColor: '#ccc'
  },

  labelTextStyle: {
    fontSize: 15,
    fontWeight: "800",
  },

  buttonsStyle: {
    flexDirection: 'row',
  },

  buttonStyle: {
    padding: 10,
    margin: 10,
    backgroundColor: 'green',
  },

  submitButtonStyle: {
    backgroundColor: 'green',
  },

  cancelButtonStyle: {
    backgroundColor: 'red',
  },

  buttonTextStyle: {
    fontWeight: 'bold',
    color: 'white',
  },

});
