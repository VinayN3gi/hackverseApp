'use client'
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy checkpoint data for one driver
const checkpoints = [
  { name: "Depot", reached: true, time: "09:00 AM" },
  { name: "Highway Checkpoint", reached: true, time: "11:15 AM" },
  { name: "City Storage Yard", reached: false, time: null },
  { name: "Petroleum Plant", reached: false, time: null },
];

// ✅ Header Component
const Header = () => {
  return (
    <View className="w-full bg-blue-700 py-4 rounded-lg shadow mb-5">
      <Text className="text-center text-2xl font-bold text-white">
        Driver Dashboard
      </Text>
      <Text className="text-center text-sm text-blue-100">
        Track your journey and ask AI for assistance
      </Text>
    </View>
  );
};

// ✅ Checkpoint Panel Component
const CheckpointPanel = ({ checkpoints }: any) => {
  return (
    <View className="bg-white rounded-2xl shadow-lg border border-gray-200 h-[55%] p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        My Checkpoints
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {checkpoints.map((cp: any, index: number) => (
          <View key={index} className="flex-row items-start relative mb-6">
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
              <Text
                className={`font-medium ${
                  cp.reached ? "text-green-700" : "text-gray-900"
                }`}
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
};

// ✅ ChatGPT Response Box
const ChatResponseBox = ({ response }: any) => {
  return (
    <View className="bg-blue-50 rounded-2xl shadow-md border border-blue-200 h-[25%] p-4 mb-4">
      <Text className="text-lg font-semibold text-blue-700 mb-2">
        AI Assistant
      </Text>
      <ScrollView>
        <Text className="text-gray-800 leading-relaxed">
          {response || "💡 Ask me anything about your journey..."}
        </Text>
      </ScrollView>
    </View>
  );
};

// ✅ Input Bar Component
const ChatInputBar = ({ onSend }: any) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <View className="bg-white rounded-full shadow-md border border-gray-200 flex-row items-center px-3 py-2">
      <TextInput
        className="flex-1 px-3 py-2 text-gray-800"
        placeholder="Type your question..."
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity
        onPress={handleSend}
        className="bg-blue-600 px-5 py-2 rounded-full ml-2"
      >
        <Text className="text-white font-semibold">Send</Text>
      </TouchableOpacity>
    </View>
  );
};

// ✅ Main Screen
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4 space-y-4">
      <Header />
      <CheckpointPanel checkpoints={checkpoints} />
      <ChatResponseBox response={response} />
      <ChatInputBar onSend={handleSendPrompt} />
    </SafeAreaView>
  );
}
