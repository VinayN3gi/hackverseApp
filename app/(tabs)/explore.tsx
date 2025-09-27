"use client";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Dummy previous safety concerns
const initialConcerns = [
  { id: 1, title: "Fuel Leak Detected", time: "10:45 AM" },
  { id: 2, title: "Tire Pressure Low", time: "09:20 AM" },
];

// Header
const Header = () => (
  <View className="w-full bg-blue-700 py-4 rounded-lg shadow mb-4">
    <Text className="text-center text-2xl font-bold text-white">
      Safety Dashboard
    </Text>
    <Text className="text-center text-sm text-blue-100">
      Review and raise safety concerns during your journey
    </Text>
  </View>
);

// Component to show list of concerns
const ConcernList = ({ concerns }: any) => (
  <View className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 p-4 mb-4">
    <Text className="text-lg font-semibold text-gray-800 mb-3">
      My Safety Concerns
    </Text>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={true}
    >
      {concerns.map((c: any) => (
        <View
          key={c.id}
          className="flex-row items-center mb-4 bg-blue-50 rounded-xl p-3"
        >
          <Ionicons
            name="shield-checkmark"
            size={24}
            color="#dc2626" // always red
            style={{ marginRight: 10 }}
          />
          <View className="flex-1">
            <Text className="font-medium text-gray-900">{c.title}</Text>
            <Text className="text-xs text-gray-500">Reported at {c.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

// Form to raise a new concern
const RaiseConcernForm = ({ onSubmit }: any) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input.trim());
    setInput("");
    Keyboard.dismiss();
  };

  return (
    <View className="bg-blue-50 rounded-2xl shadow-md border border-blue-200 p-4 mb-4">
      <Text className="text-lg font-semibold text-blue-700 mb-2">
        Raise New Concern
      </Text>
      <TextInput
        placeholder="Describe the safety issue..."
        value={input}
        onChangeText={setInput}
        multiline
        style={styles.textArea}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.raiseButton}>
        <Text style={styles.raiseButtonText}>Submit Concern</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Safety Screen
export default function SafetyScreen() {
  const [concerns, setConcerns] = useState(initialConcerns);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  async function sendConcern(text: string) {
    await addDoc(collection(db, "notifications"), {
      driverID: "YdS7cEgFv6We3ziFoVQu",
      text: text,
      createdAt: serverTimestamp(),
      type: "concern",
    });

    /*let ngrokUrl = process.env.EXPO_PUBLIC_NGROK_URL;
    await fetch(`${ngrokUrl}/api/concern`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Ramesh: ${text}` }),
    });
    console.log("Concern sent");*/
  }

  const handleNewConcern = (text: string) => {
    sendConcern(text);

    const newConcern = {
      id: concerns.length + 1,
      title: text,
      time: formatTime(new Date()), // nicely formatted
    };
    setConcerns([newConcern, ...concerns]);
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 80;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={{ flex: 1, padding: 16 }}>
            <Header />
            <ConcernList concerns={concerns} />
            <RaiseConcernForm onSubmit={handleNewConcern} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#111827",
    marginBottom: 12,
  },
  raiseButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  raiseButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
