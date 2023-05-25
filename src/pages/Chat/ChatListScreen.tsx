import * as React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  FlatList,
  RefreshControl
} from "react-native";
import ChatTitle from "./ChatTitle";
import Axios from "axios";
import useStore from "../../../store";
import BottomTabs from "../../components/BottomTabs";
import chatlist from "../../assets/dummy/chatlist.json";
import chats from "../../assets/dummy/chat.json";
import { useIsFocused } from "@react-navigation/native";

type RootStackParamList = {
  ChatList: undefined;
};
type ChatListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ChatList"
>;

const vw = Dimensions.get("window").width;
const vh = Dimensions.get("window").height;

function ChatListScreen({ route, navigation }: ChatListScreenProps) {
  const post = route.params?.post_id;
  const [chats, setChats] = useState([]);
  const { session, url } = useStore();
  const isFocused = useIsFocused();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const renderItem = ({ item }) => {
    return <ChatTitle chat={item} navigation={navigation} />;
  };

  const getMyChats = () => {
    Axios.get(
      `${url}/chat/get_chatroom_member_id?member_id=${session.member_id}`
    ).then((res) => {
      setChats(res.data);
      console.log(res.data);
    });
  };

  const refreshChats = () => {
    setIsRefreshing(true);
    getMyChats();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      refreshChats();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{ height: vh, backgroundColor: "white" }}>
      <View
        style={{
          height: vh / 15,
          borderBottomWidth: 1.25,
          borderColor: "#b6bcd3",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "bold" }}>채팅</Text>
      </View>
      {chats.length === 0 ? (
        <Text
          style={{
            marginHorizontal: "auto",
            marginVertical: "auto",
            color: "white",
            fontSize: 25,
            fontWeight: "bold"
          }}
        >
          아직 채팅을 하지 않았습니다
        </Text>
      ) : (
        <FlatList
          data={chats.sort((a, b) => b.last_chatMessage - a.last_chatMessage)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              onRefresh={refreshChats}
              refreshing={isRefreshing}
            />
          }
        />
      )}
      <BottomTabs navigation={navigation} screen="ChatList" />
    </SafeAreaView>
  );
}

export default ChatListScreen;
