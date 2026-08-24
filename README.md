# yourfinance-backend
# YourFinance

YourFinance is a **progressive web application (PWA)** designed to help users take control of their personal finances. Built with a modern tech stack—**Ionic Angular frontend** and **C# .NET backend**—it leverages **OpenAI's API** to intelligently process receipts and provide meaningful financial insights.

---

## Features

- **AI-Powered Receipt Scanning**  
  Upload receipts and extract key transaction details (store name, amount, date) using OpenAI’s API.

- **Expense & Income Tracking**  
  Log, categorize, and review all your income and expenses in a simple and clean interface.

- **Trend Analysis**  
  Visualize your spending patterns over time with helpful charts and summaries.

- **Future Spending Predictions**  
  Let AI forecast your spending behavior to help you plan ahead.

- **Budget Building**  
  Create and maintain monthly budgets based on your actual spending and financial goals.

- **Cross-Platform Access**  
  As a PWA, YourFinance works seamlessly on desktop and mobile devices with offline support.

---

## Tech Stack

| Layer         | Technology           |
|--------------|----------------------|
| Frontend     | Ionic + Angular      |
| Backend      | C# .NET Web API      |
| AI Integration | OpenAI API          |
| Data Storage | PostgreSQL           |

---

## Getting Started

### Prerequisites

- Node.js & npm
- .NET 7 SDK or later
- PostgreSQL
- OpenAI API Key

### Frontend Setup

```bash
cd yourfinance-frontend
npm install
ionic serve
