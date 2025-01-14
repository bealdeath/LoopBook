// File: src/screens/ProjectListScreen.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store"; // Adjust path if needed
import { addProject, deleteProject, Project } from "../redux/slices/projectSlice";
import { v4 as uuidv4 } from "uuid";
import { useNavigation } from "@react-navigation/native";

export default function ProjectListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const projects = useSelector((state: RootState) => state.projects.data);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Project name is required.");
      return;
    }
    const newProj: Project = {
      id: uuidv4(),
      name: newProjectName,
      description: newProjectDesc,
    };
    dispatch(addProject(newProj));
    setNewProjectName("");
    setNewProjectDesc("");
  };

  const handleOpenProject = (projectId: string) => {
    navigation.navigate("ProjectDetail" as never, { projectId } as never);
  };

  const handleDeleteProject = (projectId: string) => {
    dispatch(deleteProject(projectId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.projectItem} onPress={() => handleOpenProject(item.id)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.projectName}>{item.name}</Text>
              <Text style={styles.projectDesc}>{item.description}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteProject(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>X</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Add new project */}
      <View style={styles.newProjectContainer}>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          value={newProjectName}
          onChangeText={setNewProjectName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newProjectDesc}
          onChangeText={setNewProjectDesc}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddProject}>
          <Text style={styles.addBtnText}>Add Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  projectItem: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  projectName: { fontSize: 16, fontWeight: "600" },
  projectDesc: { fontSize: 14, color: "#666" },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteBtnText: { color: "#fff", fontWeight: "bold" },
  newProjectContainer: { marginTop: 20 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
});
