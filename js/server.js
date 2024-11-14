const WebSocket = require('ws');

// 웹소켓 서버 생성
const wss = new WebSocket.Server({ port: 8080 });
let connectedClients = 0;  // 연결된 클라이언트 수 추적

wss.on('connection', (ws) => {
  connectedClients += 1;
  console.log('클라이언트가 연결되었습니다.');
  console.log(`현재 연결된 클라이언트 수: ${connectedClients}`);

  // 두 클라이언트가 연결되었을 때 메시지 전송
  if (connectedClients >= 2) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message: `${connectedClients}명의 클라이언트가 연결되었습니다!`, type: 'info' }));
      }
    });
  } else if (connectedClients === 1) {
    // 한 명만 연결되었을 때
    ws.send(JSON.stringify({ message: '채팅방에 혼자 있습니다. 상대방을 기다려주세요.', type: 'info' }));
  }

  // 클라이언트로부터 메시지를 받을 때
  ws.on('message', (message) => {
    // Blob 객체인지 확인하고, Blob인 경우 텍스트로 변환
    if (message instanceof Buffer) {
      message = message.toString('utf-8');
    }
    
    console.log(message);

    // 모든 연결된 클라이언트에게 메시지 브로드캐스트
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        // 메시지와 함께 sender 정보를 보내기
        client.send(JSON.stringify({ message: message, type: 'chat', sender: ws._socket.remoteAddress }));
      }
    });
  });

  // 연결 종료 시
  ws.on('close', () => {
    connectedClients -= 1;
    console.log('클라이언트 연결이 종료되었습니다.');
    console.log(`현재 연결된 클라이언트 수: ${connectedClients}`);

    // 상대방이 나갔을 때
    if (connectedClients === 1) {
      // 남은 클라이언트에게 상대방이 나갔음을 알림
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message: '채팅방에 혼자 있습니다.', type: 'info' }));
        }
      });
    } else if (connectedClients === 0) {
      // 클라이언트가 모두 나갔을 때
      console.log('채팅방에 남아있는 클라이언트가 없습니다.');
    }
  });
});

console.log('웹소켓 서버가 포트 8080에서 실행 중입니다.');
