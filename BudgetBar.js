import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { collection, doc, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase'; 

const BudgetBar = ({ label, budget, spent }) => {
  const remaining = budget - spent; // 남은 예산 계산
  const progress = budget > 0 ? Math.max(remaining / budget, 0) : 0; // 남은 예산 비율

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      <Text style={styles.amountText}>{remaining.toLocaleString()} 원</Text>
      <Progress.Bar
        progress={progress}
        width={null}
        height={12}
        color="#000"
        unfilledColor="#bbb"
        borderRadius={6}
        borderWidth={0}
        style={styles.progressBar}
      />
    </View>
  );
};

export default function BarView() {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchBudgetAndExpenses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('User not logged in!');
          return;
        }

        const userMail = user.email;

        // 예산 데이터 가져오기
        const budgetDoc = doc(db, userMail, 'budget');
        const budgetSnapshot = await getDocs(collection(db, userMail));
        budgetSnapshot.forEach((doc) => {
          if (doc.id === 'budget') {
            setMonthlyBudget(doc.data().monthlyBudget || 0);
            setDailyBudget(doc.data().dailyBudget || 0);
          }
        });

        // Firestore에서 receipt 문서의 지출 하위 컬렉션 데이터 가져오기
        const receiptDoc = doc(db, userMail, 'receipt');
        const expensesCollection = collection(receiptDoc, 'expenses');
        const snapshot = await getDocs(expensesCollection);

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();

        let totalExpenses = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();

          let expenseDate;
          if (data.date && data.date.seconds) {
            expenseDate = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1e6);
          } else {
            console.error('Missing or invalid date field in document:', doc.id);
            return; // 잘못된 데이터는 무시
          }

          console.log('Expense Date:', expenseDate);

          // 현재 연도, 월, 날짜와 비교
          if (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getDate() === currentDate
          ) {
            totalExpenses += data.amount || 0; // amount필드 값 합산
          }
        });

        setTotalSpent(totalExpenses); // 총 지출값 설정
      } catch (error) {
        console.error('Error ', error);
      }
    };

    fetchBudgetAndExpenses();
  }, []);

  return (
    <View>
      <BudgetBar label="남은 예산 (월별)" budget={monthlyBudget} spent={totalSpent} />
      <BudgetBar label="남은 예산 (일별)" budget={dailyBudget} spent={totalSpent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    marginTop: 8,
  },
  text: {
    color: 'black',
    fontSize: 14,
  },
  amountText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
