"use client";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>History</Text>
    <Text style={styles.headerSubtitle}>Review your past AI prompts</Text>
  </View>
);

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    const stored = await AsyncStorage.getItem("chatHistory");
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(parsed.slice().reverse());
    } else {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setInterval(() => {
      fetchHistory();
    }, 10000);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  const handlePress = (item: any) => {
    setSelected(item);
    setModalVisible(true);
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 80;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={{ flex: 1, padding: 16 }}>
            <Header />

            {/* List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Past Prompts</Text>

              {refreshing && (
                <View style={styles.refreshIndicator}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={{ marginLeft: 6, color: "#2563eb" }}>
                    Refreshing…
                  </Text>
                </View>
              )}

              <ScrollView
                style={{ flex: 1 }}
                // make container at least full height so pull-to-refresh works even empty
                contentContainerStyle={{
                  paddingBottom: 16,
                  minHeight: Dimensions.get("window").height * 0.4,
                  justifyContent:
                    history.length === 0 ? "center" : "flex-start",
                }}
                showsVerticalScrollIndicator={true}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                {history.length === 0 && (
                  <Text style={styles.emptyText}>No history yet</Text>
                )}

                {history.map((h: any) => (
                  <TouchableOpacity
                    key={h.id}
                    onPress={() => handlePress(h)}
                    style={styles.listItem}
                  >
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={24}
                      color="#2563eb"
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemPrompt} numberOfLines={1}>
                        {h.prompt}
                      </Text>
                      <Text style={styles.itemTime}>
                        {new Date(h.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Modal */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Full Conversation</Text>

                  {selected && (
                    <ScrollView style={{ maxHeight: 300 }}>
                      <Text style={styles.modalLabel}>You:</Text>
                      <Text style={styles.modalText}>{selected.prompt}</Text>

                      <Text style={[styles.modalLabel, { marginTop: 12 }]}>
                        AI:
                      </Text>
                      <Text style={styles.modalText}>
                        {selected.answer ?? "No AI answer saved"}
                      </Text>
                    </ScrollView>
                  )}

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#bfdbfe",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flex: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemPrompt: {
    fontWeight: "500",
    color: "#111827",
  },
  itemTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 4,
  },
  modalText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
