"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Header
const Header = () => (
  <View className="w-full bg-blue-700 py-4 rounded-lg shadow mb-4">
    <Text className="text-center text-2xl font-bold text-white">
      Driver Dashboard
    </Text>
    <Text className="text-center text-sm text-blue-100">
      Track your journey and ask AI for assistance
    </Text>
  </View>
);

// Checkpoint Panel
const CheckpointPanel = ({ checkpoints }: any) => (
  <View className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
    <Text className="text-lg font-semibold text-gray-800 mb-3">
      My Checkpoints
    </Text>
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {checkpoints.map((cp: any, index: number) => (
        <View key={index} className="flex-row items-start relative mb-5">
          {index !== checkpoints.length - 1 && (
            <View
              className={`absolute left-4 top-6 w-[2px] h-full ${
                cp.reached ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          )}
          <View
            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
              cp.reached ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            <Text className="text-white font-bold text-xs">{index + 1}</Text>
          </View>
          <View className="ml-4">
            <Text
              className={`${
                cp.reached ? "text-green-700" : "text-gray-900"
              } font-medium`}
            >
              {cp.name}
            </Text>
            {cp.time && (
              <Text className="text-sm text-gray-500">{cp.time}</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

// Chat input bar
const ChatInputBar = ({ onSend, loading }: any) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
    Keyboard.dismiss();
  };

  return (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-3xl px-3 py-2 shadow shadow-black/5 mt-3">
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your question..."
        placeholderTextColor="#9ca3af"
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!loading}
        className="flex-1 text-base text-gray-900 px-2"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={loading}
        className={`ml-2 px-5 py-3 rounded-2xl ${
          loading ? "bg-gray-400" : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        <Text className="text-white font-bold">
          {loading ? "Sending..." : "Send"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DriverScreen() {
  const [response, setResponse] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [cargoModalVisible, setCargoModalVisible] = useState(false);

  const [checkpoints, setCheckpoints] = useState([
    { name: "Depot", reached: true, time: "07:00 PM" },
    { name: "Quality Control Checkpoint", reached: false, time: null },
    { name: "City Storage Yard", reached: false, time: null },
    { name: "Petroleum Plant", reached: false, time: null },
  ]);

  const insets = useSafeAreaInsets();
   const cargoInfo = `
      Cargo ID: CARGO-8723
      Description: Premium Petroleum Barrels
      Weight: 12,500 kg
      Destination: Petroleum Plant
      Hazard Class: 3 – Flammable Liquids
      Special Notes: Handle with care. Ensure seal verification at each checkpoint.
        `;

  // Listen for keyboard show/hide
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

 const handleSendPrompt = async (prompt: string) => {
  try {
    setLoading(true);

    // 1️⃣ Load existing chat history
    const existingHistory = await AsyncStorage.getItem("chatHistory");
    const parsedHistory = existingHistory ? JSON.parse(existingHistory) : [];

    const previousMessages = parsedHistory.flatMap((m: any) => [
      { role: "user", content: m.prompt },
      { role: "assistant", content: m.answer },
    ]);

    // 2️⃣ Add local data (cargo info + checkpoints) as context
    const localData = `
Cargo Information:
${cargoInfo}

Checkpoints:
${checkpoints
  .map(
    (cp, idx) =>
      `${idx + 1}. ${cp.name} - ${cp.reached ? "Reached" : "Pending"}${
        cp.time ? ` at ${cp.time}` : ""
      }`
  )
  .join("\n")}
    `;

    // 3️⃣ Build full message set
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant for a delivery driver.
You have access to the following locally stored information:
${localData}
Always use this context when answering questions.`,
      },
      ...previousMessages,
      { role: "user", content: prompt },
    ];

    // 4️⃣ Call OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
      }),
    });

    const data = await res.json();
    const answer =
      data.choices?.[0]?.message?.content || "No response received";

    // 5️⃣ Show in modal
    setResponse(answer);
    setModalVisible(true);

    // 6️⃣ Save back into history
    const newMessage = {
      id: Date.now(),
      prompt,
      answer,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [...parsedHistory, newMessage];
    await AsyncStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.error(error);
    setResponse("Error fetching response");
    setModalVisible(true);
  } finally {
    setLoading(false);
  }
};


  const sendNotif = async () => {
    let nextCp;
    let toChange = 0;
    let newCps = [...checkpoints];

    for (let [idx, i] of checkpoints.entries()) {
      if (i.reached === false) {
        nextCp = i.name;
        toChange = idx;
        break;
      }
    }

    /*await fetch(`${ngrokUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Reached ${nextCp}` }),
    });*/

    await addDoc(collection(db, "notifications"), {
      driverID: "YdS7cEgFv6We3ziFoVQu",
      text: `Reached ${nextCp}`,
      createdAt: serverTimestamp(),
      type: "checkpoint",
    });

    newCps[toChange].reached = true;
    setCheckpoints(newCps);
  };
//                disabled={checkpoints[checkpoints.length - 1].reached}

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={insets.bottom}
        >
          <View className="flex-1 px-4">
            <Header />
            <CheckpointPanel checkpoints={checkpoints} />

            {/* Show only when keyboard is NOT visible */}
            {!isKeyboardVisible && (
              <>
              <TouchableOpacity
                onPress={sendNotif}
                className="w-full bg-green-600 py-4 mb-6 rounded-2xl flex-row items-center justify-center shadow shadow-black/10 active:bg-green-700 disabled:bg-gray-400"
              >
                <Text className="text-white text-lg font-bold">
                  Reached Checkpoint
                </Text>
              </TouchableOpacity>
               <TouchableOpacity
                  onPress={() => setCargoModalVisible(true)}
                  className="w-full bg-yellow-600 py-4 mb-6 rounded-2xl flex-row items-center justify-center shadow shadow-black/10 active:bg-yellow-700"
                >
                  <Text className="text-white text-lg font-bold">
                    Cargo Information
                  </Text>
                </TouchableOpacity>
              
              </>


            )}

            <View className="mt-auto mb-2">
              <ChatInputBar onSend={handleSendPrompt} loading={loading} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Modal for AI Answer */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>AI Assistant</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalText}>{response}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

     <Modal
  visible={cargoModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setCargoModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.cargoBox}>
      {/* Header */}
      <View style={styles.cargoHeader}>
        <Text style={styles.cargoTitle}>Cargo Information</Text>
        <TouchableOpacity onPress={() => setCargoModalVisible(false)}>
          <Text style={styles.cargoClose}>✕</Text>
        </TouchableOpacity>
      </View>
        <ScrollView
        style={styles.cargoScroll}
        showsVerticalScrollIndicator={false}
      >
        {cargoInfo
          .trim()
          .split("\n")
          .filter(Boolean)
          .map((line, idx) => {
            const [rawLabel, ...rest] = line.split(":");
            const label = (rawLabel || "").trim();
            const value = (rest.join(":") || "").trim();

            return (
              <View key={idx} style={styles.cargoRow}>
                {/* both pieces are inside Text */}
                <Text style={styles.cargoLabel}>{label}</Text>
                <Text style={styles.cargoValue}>{value}</Text>
              </View>
            );
          })}
      </ScrollView>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setCargoModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cargoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cargoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cargoTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  cargoClose: {
    fontSize: 24,
    color: "#6b7280",
    paddingHorizontal: 4,
  },
  cargoScroll: {
    maxHeight: 300,
    marginBottom: 12,
  },
  cargoItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cargoText: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  cargoRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: "#ffffff",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginBottom: 8,
},
cargoLabel: {
  width: 150,              // fixed width for perfect alignment
  fontSize: 14,
  color: "#6b7280",
  fontWeight: "600",
  paddingRight: 8,
},
cargoValue: {
  flex: 1,                 // value wraps but stays aligned
  fontSize: 16,
  color: "#111827",
  lineHeight: 22,
},
});
