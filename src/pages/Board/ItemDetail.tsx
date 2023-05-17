import * as React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  ListRenderItem,
  Dimensions,
  TouchableOpacity,
  Image,
  Pressable,
  StatusBar,
  PixelRatio,
  Modal
} from "react-native";
import Axios from "axios";
import ItemList from "./ItemList";
import useStore from "../../../store";
import memberlist from "../../assets/dummy/member.json";
import chatlist from "../../assets/dummy/chatlist.json";
import bugi from "../../assets/bugi.png";
import fav from "../../assets/design/favorite.png";
import unfav from "../../assets/design/unfavorite.png";
import { useIsFocused } from "@react-navigation/native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { stackScrollInterpolator } from "../../utils/animations";

type RootStackParamList = {
  Detail: undefined;
};
type ItemDetailProps = NativeStackScreenProps<RootStackParamList, "Detail">;

const vw = Dimensions.get("window").width;
const vh = Dimensions.get("window").height;

function ItemDetail({ route, navigation }: ItemDetailProps) {
  const { session, url } = useStore();
  const board = route.params.board;
  // const track = memberlist.memberlist.filter(
  //   (item) => board.writer === item.username
  // )[0].firsttrack;
  const [writer, setWriter] = useState("");
  const [writerImage, setWriterImage] = useState("");
  const [pressed, setPressed] = useState(false);
  const [category, setCategory] = useState("");
  const [chatroom, setChatroom] = useState();
  const [chatrooms, setChatrooms] = useState();
  const [diff, setDiff] = useState("");
  const timestamp = board.createdDate;
  const [isFav, setIsFav] = useState(route.params.isFav);
  const [isFavOn, setIsFavOn] = useState(false);
  const isFocused = useIsFocused();
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const moment = require("moment");
  const date = new moment(timestamp);
  const toUpdate = useCallback(() => {
    navigation.navigate("Add", { board: board });
  }, [board, navigation]);

  const timeCalc = () => {
    const now = new moment();
    const gapTime = now.diff(date, "minutes");
    const gapHour = now.diff(date, "hours");
    const gapDay = now.diff(date, "days");
    const isAm = date.format("A") === "AM" ? "오전" : "오후";
    if (gapTime < 1) {
      return "방금 전";
    } else if (gapTime < 60) {
      return `${gapTime}분 전`;
    } else if (gapHour < 24) {
      return `${gapHour}시간 전`;
    } else if (gapDay < 7) {
      return `${gapDay}일 전`;
    } else {
      return `${date.format(`YYYY년 M월 D일 ${isAm} 시 m분`)}`;
    }
  };

  const favControll = useEffect(() => {
    if (isFav === 0) setIsFavOn(false);
    else setIsFavOn(true);
  }, [isFocused]);

  const doFav = () => {
    setIsFavOn(!isFavOn);
    Axios.post(
      `${url}/profile/add_favorite`,
      {},
      { params: { postId: board.post_id, userId: session?.member_id } }
    ).then((res) => {
      console.log("좋아요 Id : " + res.data);
    });
  };

  const unFav = () => {
    setIsFavOn(!isFavOn);
    Axios.delete(`${url}/profile/delete_favorite3`, {
      params: { postId: board.post_id, userId: session?.member_id }
    })
      .then((res) => {
        console.log("좋아요 취소");
      })
      .catch((error) => {
        console.log(error);
        console.log("취소 실패");
      });
  };

  const toMyChat = useCallback(() => {
    navigation.navigate("ChatListFromPost", { post: board });
  }, [navigation]);

  const toQuest = useCallback(() => {
    /** Axios.get() 으로 api 접속해서 post_id, memberA, memberB 를 게시글의 post_id, writer, zustand에 저장된 id 로 검색해서
     * 유무 판단해서 있으면 기존 채팅방을 리턴, 없으면 새로 채팅방 만들고 리턴 후 ChatDetail 로 이동
     */
    const chatStartRequestDTO = {
      post_id: board.post_id,
      member_id: session?.member_id
    };
    console.log(chatStartRequestDTO);
    Axios.post(`${url}/chat/start`, chatStartRequestDTO, {
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => {
        console.log(res.data);
        navigation.navigate("ChatDetail", {
          chatroom: res.data,
          post: board
        });
      })
      .catch((error) => console.log(error));
    // navigation.navigate("ChatDetail", {
    //   chatroom: chatroom,
    //   post: board
    // });
  }, [board, chatroom, navigation]);

  const changeImageState = () => {
    setPressed(!pressed);
  };

  const matchingCategories = () => {
    switch (board.category) {
      case "book":
        setCategory("도서");
        break;
      case "pencil":
        setCategory("필기구");
        break;
      case "clothes":
        setCategory("의류");
        break;
      case "digital":
        setCategory("디지털 기기");
        break;
      case "beauty":
        setCategory("뷰티/미용");
        break;
      case "goods":
        setCategory("부기 굿즈");
        break;
    }
  };

  useEffect(() => {
    console.log(board.member_id);
    Axios.get(
      `${url}/post/details?postId=${board.post_id}&userId=${session?.member_id}`
    ).catch((error) => console.log(error));
    Axios.get(`${url}/member/get_username?id=${board.member_id}`)
      .then((res) => {
        setWriter(res.data);
      })
      .catch((err) => console.log(err));
    Axios.get(`${url}/member/get_image?member_id=${board.member_id}`)
      .then((res) => {
        setWriterImage(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    //Axios.get(`${url}`);
    matchingCategories();
  }, [isFav]);

  const DATA = board?.images?.map((item, index) => {
    return {
      id: index,
      image: { uri: `${url}/images/${item}` }
    };
  });

  const renderCarouselItem = ({ item, index }) => {
    return (
      <Pressable onPress={() => setModalVisible(index)}>
        <View style={styles.carouselItemContainer}>
          <Image source={item.image} style={styles.carouselImage} />
        </View>
      </Pressable>
    );
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderPagination = useCallback(() => {
    return (
      <Pagination
        dotsLength={DATA.length}
        activeDotIndex={activeIndex}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.paginationDot}
        inactiveDotOpacity={0.6}
        inactiveDotScale={0.7}
      />
    );
  }, [activeIndex]);

  return (
    <View style={pressed ? { backgroundColor: "black" } : styles.container}>
      <StatusBar barStyle={pressed ? "light-content" : "dark-content"} />
      <ScrollView>
        <View style={styles.carouselContainer}>
          <Carousel
            layout="default"
            data={DATA}
            renderItem={renderCarouselItem}
            sliderWidth={vw}
            itemWidth={vw}
            inactiveSlideOpacity={1}
            onSnapToItem={(index) => setActiveIndex(index)}
            scrollInterpolator={stackScrollInterpolator}
          />
          {renderPagination()}
        </View>
        <Modal
          visible={modalVisible !== false}
          onRequestClose={closeModal}
          animationType="fade"
          presentationStyle="overFullScreen"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeModal}>
                <Text style={styles.modalCloseButton}>X</Text>
              </Pressable>
            </View>
            <Image
              source={DATA[activeIndex].image}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
        <View style={styles.content}>
          <View style={styles.postWriterBar}>
            <Image
              source={{ uri: `${url}/images/${writerImage}` }}
              style={styles.writerImage}
            />
            <View style={styles.writerProps}>
              <View style={styles.propsTop}>
                <Text style={{ fontSize: 20 }}>{writer}</Text>
              </View>
              <View style={styles.propsBottom}>
                <Text style={{ fontSize: 14 }}>{session?.firstTrack}</Text>
              </View>
            </View>
            <View
              style={
                session?.member_id === board.member_id
                  ? styles.postSetting
                  : { zIndex: -10, opacity: 0 }
              }
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Pressable style={styles.updateButton} onPress={toUpdate}>
                  <Text>수정</Text>
                </Pressable>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Pressable style={styles.deleteButton}>
                  <Text>삭제</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View style={styles.hr} />
          <View style={styles.postTitle}>
            <Text
              style={{
                fontSize: 25,
                fontWeight: "400",
                color: "black"
              }}
            >
              {board.title}
            </Text>
          </View>
          <View style={styles.postEtc}>
            <Pressable>
              <View style={{}}>
                <Text
                  style={{
                    color: "#a6a6a6",
                    fontSize: 14
                  }}
                >
                  {board.category}
                </Text>
              </View>
            </Pressable>
            <Text style={{ color: "#a6a6a6", fontSize: 14 }}>
              {" "}
              · {` ${timeCalc()}`}
            </Text>
          </View>
          <Text style={styles.postContent}>{board.text}</Text>
        </View>
      </ScrollView>
      <View style={styles.hr} />
      <View style={styles.buttonBar}>
        <View style={styles.favButton}>
          <Pressable onPress={isFavOn ? unFav : doFav}>
            <Image
              source={isFavOn ? fav : unfav}
              style={{
                width: 30,
                height: 30,
                overflow: "visible"
              }}
            />
          </Pressable>
        </View>
        <View style={styles.vr} />
        <View style={styles.priceBar}>
          <View style={styles.priceText}>
            <Text style={{ fontSize: 20 }}>{board.price}원</Text>
          </View>
          <View style={styles.nego}>
            <Text style={{ fontSize: 12, color: "#7b7b7c" }}>
              가격 협상 불가
            </Text>
          </View>
        </View>
        <View style={styles.functionalSpace}>
          <Pressable
            style={styles.functionalButton}
            onPress={
              board.member_id === session?.member_id ? toMyChat : toQuest
            }
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {board.member_id === session?.member_id ? "채팅목록" : "문의하기"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hr: {
    height: 0,
    borderBottomWidth: 0.34,
    width: vw - vw / 20,
    marginLeft: vw / 40,
    borderColor: "#a8a8a8"
  },
  vr: {
    height: vh / 14,
    width: 0,
    borderLeftWidth: 0.33,
    borderColor: "#a8a8a8"
  },
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  content: {
    //marginTop: vh / 2.2
  },
  postWriterBar: {
    flexDirection: "row",
    alignItems: "center",
    height: vh / 10,
    width: vw - vw / 4,
    paddingLeft: 10
  },
  writerImage: {
    width: 55,
    height: 55,
    borderWidth: 0.1,
    borderRadius: 55,
    overflow: "hidden"
  },
  writerProps: {
    flexDirection: "column",
    justifyContent: "flex-start",
    marginLeft: 10
  },
  propsTop: {
    height: vh / 20,
    paddingTop: 20,
    width: vw - vw / 2.25,
    justifyContent: "center"
  },
  propsBottom: {
    height: vh / 20,
    width: vw - vw / 2.25,
    paddingBottom: 20,
    justifyContent: "center"
  },
  postImage: {
    width: vw,
    height: vh / 2.2,
    overflow: "hidden",
    position: "absolute"
  },
  pressedImage: {
    width: vw,
    height: vh / 1.35,
    backgroundColor: "black",
    marginVertical: vh / 10
  },
  postSetting: {
    width: vw / 4.5,
    height: vh / 12.5,
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: "center"
  },
  updateButton: {
    justifyContent: "center",
    alignItems: "center",
    width: vw / 5.5,
    height: vh / 32,
    borderRadius: 30,
    backgroundColor: "#c3c2d0"
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: vw / 5.5,
    height: vh / 32,
    borderRadius: 30,
    backgroundColor: "#c3c2d0"
  },
  postTitle: {
    FlexDirection: "row",
    justifyContent: "flex-start",
    marginLeft: 12,
    marginTop: 12,
    marginBottom: 5
  },
  postEtc: {
    flexDirection: "row",
    marginLeft: 15
  },
  postContent: {
    fontSize: 15,
    marginHorizontal: 12.5,
    marginTop: 15,
    fontWeight: "400",
    color: "black",
    // height: vh / 4.75,
    height: vh / 4.5
  },
  buttonBar: {
    height: vh / 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vh / 75
  },
  favButton: {
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center"
  },
  priceBar: {
    height: 65,
    width: vw - vw / 2.1,
    marginRight: 5,
    marginLeft: 5
  },
  priceText: {
    width: vw - vw / 2.1,
    height: 32.5,
    flowDirection: "column",
    justifyContent: "flex-end",
    paddingLeft: 5
  },
  nego: {
    height: 32.5,
    paddingLeft: 10
  },
  functionalSpace: {
    width: vw - vw / 1.37,
    height: vh / 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  functionalButton: {
    width: 95,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#0b60fe",
    justifyContent: "center",
    alignItems: "center"
  },
  carouselContainer: {
    width: vw,
    height: vh * 0.5
  },
  carouselItemContainer: {
    width: vw,
    height: vh / 1.9,
    justifyContent: "center",
    alignItems: "center"
  },
  carouselImage: {
    width: vw * 1.12,
    height: vh * 0.8
  },
  paginationContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 10
  },
  paginationDot: {
    width: 6,
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.92)"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: vh / 10
  },
  modalHeader: {
    top: vh / 9,
    right: vw / 2.3,
    zIndex: 2,
    padding: 20
  },
  modalCloseButton: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold"
  },
  modalImage: {
    width: vw,
    height: vh
  }
});

export default ItemDetail;
