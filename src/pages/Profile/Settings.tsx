import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  TouchableOpacity
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../App";
import LocationCalc from "../../components/LocationCalc";
import useStore from "../../../store";

const vw = Dimensions.get("window").width;
const vh = Dimensions.get("window").height;

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Settings"
>;

function Settings({ navigation }: SettingsScreenProps) {
  const { session, url } = useStore();

  const toProfile = useCallback(() => {
    navigation.navigate("Profile");
  }, [navigation]);
  
  useEffect(() => {
    Axios.get(`${url}/purchasedlistV2`)
    .then(res => {
      console.log(res.data);
    })
    .catch(e => {
      console.log(e);
    })
  })
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={toProfile}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../assets/design/backIcon.png")}
            style={styles.backButton}
          />
        </TouchableOpacity>
      </View>
      <LocationCalc />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: "white",
    width: vw,
    height: vh
  },
  topBar: {
    borderBottomWidth: 0.2,
    borderColor: "gray",
    height: vh / 18,
    flexDirection: "row",
    alignItems: "center"
  },
  backButton: {
    width: vw / 22,
    height: vh / 36
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: vw / 35,
    paddingRight: vw / 35,
    height: vh / 17.5
  }
});

export default Settings;
