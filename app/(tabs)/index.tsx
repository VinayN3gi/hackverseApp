'use client'
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy checkpoint data for one driver
const checkpoints = [
  { name: "Depot", reached: true, time: "09:00 AM" },
  { name: "Highway Checkpoint", reached: true, time: "11:15 AM" },
  { name: "City Storage Yard", reached: false, time: null },
  { name: "Petroleum Plant", reached: false, time: null },
];

// Header
const Header = () => (
  <View className="w-full bg-blue-700 py-4 rounded-lg shadow mb-4">
    <Text className="text-center text-2xl font-bold text-white">Driver Dashboard</Text>
    <Text className="text-center text-sm text-blue-100">
      Track your journey and ask AI for assistance
    </Text>
  </View>
);

// CheckpointPanel (no fixed height)
const CheckpointPanel = ({ checkpoints }: any) => {
  return (
    <View className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-3">My Checkpoints</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {checkpoints.map((cp: any, index: number) => (
          <View key={index} className="flex-row items-start relative mb-5">
            {/* Connector line */}
            {index !== checkpoints.length - 1 && (
              <View
                className={`absolute left-4 top-6 w-[2px] h-full ${
                  cp.reached ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
            {/* Circle with number */}
            <View
              className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                cp.reached ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <Text className="text-white font-bold text-xs">{index + 1}</Text>
            </View>
            {/* Label */}
            <View className="ml-4">
              <Text className={`${cp.reached ? "text-green-700" : "text-gray-900"} font-medium`}>
                {cp.name}
              </Text>
              {cp.time && <Text className="text-sm text-gray-500">{cp.time}</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Chat response box (flexible)
const ChatResponseBox = ({ response }: any) => {
  return (
    <View className="bg-blue-50 rounded-2xl shadow-md border border-blue-200 p-4 mb-4">
      <Text className="text-lg font-semibold text-blue-700 mb-2">AI Assistant</Text>
      <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
        <Text className="text-gray-800 leading-relaxed">{response || "💡 Ask me anything about your journey..."}</Text>
      </ScrollView>
    </View>
  );
};

// Chat input bar (pinned)
const ChatInputBar = ({ onSend }: any) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your question..."
        returnKeyType="send"
        onSubmitEditing={handleSend}
        style={styles.textInput}
        blurOnSubmit={false}
      />
      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main
export default function DriverScreen() {
  const [response, setResponse] = useState("");

  const handleSendPrompt = async (prompt: string) => {
    try {
      // Replace with your OpenAI API call
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_API_KEY_HERE`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "No response");
    } catch (error) {
      setResponse("❌ Error fetching response");
    }
  };

  // keyboardVerticalOffset: tune this if header height or status bar different
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 80;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Tapping outside the keyboard will close it */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {/* Scrollable content (header + panels) */}
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            <Header />
            <CheckpointPanel checkpoints={checkpoints} />
            <ChatResponseBox response={response} />
          </ScrollView>

          {/* Input pinned to bottom */}
          <View style={{ padding: 16, backgroundColor: "transparent" }}>
            <ChatInputBar onSend={handleSendPrompt} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: "#111827",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
