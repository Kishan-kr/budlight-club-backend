// 2VpvaazCUnk73lJetr3n3cvkZXR_3mDXiTjQK1FYfijdrSyqn
const express = require('express')
const connectToMongo = require('./db')
const UserRoutes = require('./Routes/User/UserRoutes')
const AdminRoutes = require('./Routes/Admin/AdminRoutes')
const AdminBankRoutes = require('./Routes/Admin/BankAccount/AdminBankRoutes')
const TransactionRoutes = require('./Routes/Transaction/TransactionRoutes')
const WalletRoutes = require('./Routes/Wallet/WalletRoutes')
const BankAccountRoutes = require('./Routes/BankAccount/BankAccountRoutes')
const BetJoinedRoutes = require('./Routes/BetJoined/BetJoinedRoutes')
const BetRoutes = require('./Routes/Bet/BetRoutes')
const FeedbackRoutes = require('./Routes/Feedback/FeedbackRoutes')
const {Server} = require('socket.io')
const cron = require('node-cron');
const http = require('http')
const app = express();
const creditInterest = require('./Utils/InterestCredit')
const createBet = require('./Utils/CreateBet')
const PORT = process.env.PORT || 80;

const interestInterval = '0 0 * * *';
const betInterval = '*/3 * * * *';
const cors = require('cors')

// create http server from express
const httpServer = http.createServer(app);

// instantiating socket io server 
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
      origin: 'http://localhost:3000',
  }
});

// Pass the io instance to the app context
app.set('io', io);

io.on('connection', socket => {
  //testing
  socket.on("hello from client", (msg) => {
    console.log("hello from client")
    console.log(msg);
  })
})

app.use(cors());
// middleware to parse incoming request body 
app.use(express.json());

// connecting to mongoDB 
connectToMongo();

// response to Homepage 
app.get('/', (req, res)=> {
  res.send('Happy hacking!')
})

// API routes 
app.use('/api/user', UserRoutes);
app.use('/api/user/transaction', TransactionRoutes);
app.use('/api/user/wallet', WalletRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/admin/bank/account', AdminBankRoutes);
app.use('/api/user/bank', BankAccountRoutes);
app.use('/api/bet', BetRoutes);
app.use('/api/bet/joined', BetJoinedRoutes);
app.use('/api/feedback', FeedbackRoutes);

// Start the cron job to credit interest
cron.schedule(interestInterval, creditInterest);

// set timer in app context 
let timer = 180;
app.set('timer', timer)

// Function to update the timer value in the app context
function updateTimer(timerValue) {
  app.set('timer', timerValue);
}

// Start the cron job to create bets
cron.schedule(betInterval, ()=> {createBet(io, updateTimer)});

// listening to app 
httpServer.listen(PORT, ()=> {
  console.log("server is running on : http://localhost:", PORT);
})
