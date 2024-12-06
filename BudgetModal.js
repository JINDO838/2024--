import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; 

export default function BudgetModal({ visible, onClose }) {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');

  const applyPress = async () => {
    try {
      const user = auth.currentUser; // 현재 로그인한 사용자 가져오기
      if (!user) {
        console.error('User not logged in!');
        return;
      }

      const userMail = user.email; // 사용자 이메일
      const budgetDoc = doc(db, userMail, 'budget'); 

      //  데이터 저장
      await setDoc(budgetDoc, {
        monthlyBudget: parseFloat(monthlyBudget) || 0, // 문자열을 숫자로 변환, 기본값 0
        dailyBudget: parseFloat(dailyBudget) || 0, 
      });

      console.log('Budget saved successfully in Firestore!');

      // 입력값 초기화
      setMonthlyBudget('');
      setDailyBudget('');

      
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.text}>예산을 입력하세요</Text>
          <View style={styles.container}>
            <Text style={styles.containerText}>월별 예산</Text>
            <TextInput
              style={styles.input}
              placeholder="월별 예산(원)"
              placeholderTextColor="gray"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.container}>
            <Text style={styles.containerText}>일별 예산</Text>
            <TextInput
              style={styles.input}
              placeholder="일별 예산(원)"
              placeholderTextColor="gray"
              value={dailyBudget}
              onChangeText={setDailyBudget}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.viewButton}>
            <TouchableOpacity style={styles.btn} onPress={onClose}>
              <Text style={styles.text}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={applyPress}>
              <Text style={styles.text}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    alignItems: 'center',
    width: 300,
    height: 600,
    padding: 20,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 35,
    borderRadius: 30,
    backgroundColor: 'lightgrey',
  },
  text: {
    color: 'black',
    fontSize: 14,
  },
  containerText: {
    color: 'black',
    fontSize: 14,
    marginRight: 15,
  },
  input: {
    width: 150,
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    color: 'black',
  },
  viewButton: {
    padding: 10,
    margin: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 11,
  },
  container: {
    alignItems: 'center',
    marginTop: 30,
    flexDirection: 'row',
  },
});
