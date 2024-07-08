// src/App.js

import React, { useState } from 'react';
import TransactionTable from './components/TransactionTable';
import TransactionStatistics from './components/TransactionStatistics';
import TransactionBarChart from './components/TransactionBarChart';

const App = () => {
  const [month, setMonth] = useState('03');  // March as default

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
  };

  return (
    <div>
      <TransactionTable onMonthChange={handleMonthChange} />
      <TransactionStatistics month={month} />
      <TransactionBarChart month={month} />
    </div>
  );
};

export default App;
