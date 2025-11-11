import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Xin chào! 👋 Tôi là trợ lý ảo của hệ thống.\n\n💡 Tôi có thể giúp bạn:\n• Tra cứu giá phòng & dịch vụ\n• Hướng dẫn thanh toán\n• Gửi phản hồi/khiếu nại\n• Giải đáp quy định chung\n\nBạn cần hỗ trợ gì nhé? 😊',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const buttonRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (isOpen) return;
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Predefined responses with enhanced training data
  const getResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Greetings
    if (msg.includes('chào') || msg.includes('hello') || msg.includes('hi') || msg.includes('xin chào')) {
      return 'Xin chào! 👋 Tôi là trợ lý ảo của hệ thống quản lý nhà trọ. Tôi có thể giúp bạn về:\n• Giá phòng và dịch vụ 💰\n• Thanh toán hóa đơn 💳\n• Gửi phản hồi/khiếu nại 📝\n• Quy định chung 📋\nBạn cần hỗ trợ gì nhé?';
    }
    
    // Pricing
    if (msg.includes('giá phòng') || msg.includes('giá thuê') || msg.includes('tiền phòng')) {
      return 'Giá phòng trọ hiện tại:\n• Phòng đơn: 1.5 - 2 triệu/tháng\n• Phòng đôi: 2.5 - 3 triệu/tháng\n• Giá tùy theo diện tích và vị trí\n💡 Bạn có thể xem chi tiết tất cả phòng trống trên trang chủ! 🏠';
    }
    
    // Utilities pricing
    if (msg.includes('giá điện') || msg.includes('tiền điện')) {
      return 'Chi phí điện:\n⚡ Giá: 3.500đ/kWh\n📊 Tính theo chỉ số công tơ thực tế\n📅 Cập nhật hàng tháng\n💡 Xem chi tiết trong phần "Hóa đơn" nhé!';
    }
    
    if (msg.includes('giá nước') || msg.includes('tiền nước')) {
      return 'Chi phí nước:\n💧 Giá: 20.000đ/m³\n📊 Tính theo đồng hồ nước\n📅 Ghi chỉ số hàng tháng\n💡 Kiểm tra hóa đơn để xem chi tiết sử dụng!';
    }
    
    if (msg.includes('điện') && msg.includes('nước')) {
      return 'Bảng giá dịch vụ:\n⚡ Điện: 3.500đ/kWh\n💧 Nước: 20.000đ/m³\n📊 Tính theo chỉ số thực tế sử dụng\n📅 Cập nhật đầu tháng\n� Bạn có thể xem lịch sử tiêu thụ trong mục "Hóa đơn"!';
    }
    
    // Services
    if (msg.includes('dịch vụ')) {
      return 'Các dịch vụ trong phòng:\n🌐 Internet WiFi tốc độ cao\n🧹 Dọn vệ sinh hành lang\n🛡️ Bảo vệ 24/7\n🅿️ Chỗ để xe miễn phí\n💰 Giá: 200-300k/tháng\n💡 Đã bao gồm trong hóa đơn hàng tháng!';
    }
    
    // Deposit
    if (msg.includes('đặt cọc') || msg.includes('tiền cọc') || msg.includes('cọc phòng')) {
      return 'Quy định đặt cọc:\n💰 Tiền cọc = 1 tháng tiền phòng\n📝 Ký hợp đồng tối thiểu 3 tháng\n✅ Hoàn trả khi trả phòng đúng hạn\n⚠️ Không hoàn nếu vi phạm hợp đồng\n💡 Liên hệ chủ trọ để biết thêm chi tiết!';
    }
    
    // Contract
    if (msg.includes('hợp đồng') || msg.includes('ký hợp đồng')) {
      return 'Thông tin hợp đồng thuê:\n📄 Hợp đồng tối thiểu: 3 tháng\n🆔 Giấy tờ cần: CMND/CCCD gốc\n📋 Ký kết tại văn phòng\n💰 Thanh toán: Cọc + Tháng đầu\n⏰ Giờ làm việc: 8h-18h (T2-T6)\n💡 Đọc kỹ điều khoản trước khi ký!';
    }
    
    // Payment methods
    if (msg.includes('thanh toán') || msg.includes('trả tiền') || msg.includes('cách trả')) {
      return 'Các phương thức thanh toán:\n💵 Tiền mặt (nộp trực tiếp)\n🏦 Chuyển khoản ngân hàng\n📱 VNPay / MoMo\n📅 Hạn thanh toán: Cuối mỗi tháng\n⚠️ Thanh toán cần chờ chủ trọ duyệt\n💡 Xem lịch sử thanh toán trong mục "Hóa đơn"!';
    }
    
    // Invoice & billing
    if (msg.includes('hóa đơn') || msg.includes('bill') || msg.includes('xem hóa đơn')) {
      return 'Về hóa đơn:\n📊 Cập nhật đầu mỗi tháng\n📱 Xem trong mục "Hóa đơn của tôi"\n💰 Bao gồm: Phòng + Điện + Nước + DV\n⏰ Hạn thanh toán: Cuối tháng\n� Bạn sẽ nhận thông báo khi có hóa đơn mới!';
    }
    
    // Available rooms
    if (msg.includes('phòng trống') || msg.includes('còn phòng') || msg.includes('xem phòng')) {
      return 'Kiểm tra phòng trống:\n🏠 Xem tất cả phòng trên Trang chủ\n✅ Lọc theo trạng thái "Còn trống"\n📍 Xem vị trí và tiện ích\n💰 So sánh giá các phòng\n📞 Liên hệ chủ trọ để đặt lịch xem phòng!';
    }
    
    // Feedback & complaints
    if (msg.includes('phản hồi') || msg.includes('khiếu nại') || msg.includes('gửi phản hồi')) {
      return 'Gửi phản hồi/khiếu nại:\n📝 Vào mục "Gửi phản hồi"\n🔧 Chọn loại: Sửa chữa/Khiếu nại/Góp ý\n⚠️ Chọn mức độ ưu tiên\n📋 Mô tả chi tiết vấn đề\n⏰ Xử lý trong 24-48h\n📜 Xem lịch sử tại "Lịch sử phản hồi"!';
    }
    
    if (msg.includes('lịch sử phản hồi') || msg.includes('phản hồi cũ')) {
      return 'Xem lịch sử phản hồi:\n📜 Vào mục "Lịch sử phản hồi"\n👁️ Xem tất cả phản hồi đã gửi\n✅ Kiểm tra trạng thái xử lý\n💬 Đọc phản hồi từ chủ trọ\n🕐 Theo dõi thời gian hoàn thành!';
    }
    
    // Repairs
    if (msg.includes('sửa chữa') || msg.includes('hỏng') || msg.includes('báo hỏng')) {
      return 'Yêu cầu sửa chữa:\n🔧 Gửi qua "Gửi phản hồi"\n⚡ Chọn loại: Sửa chữa\n⚠️ Đánh dấu mức độ ưu tiên\n📝 Mô tả chi tiết tình trạng\n⏰ Khẩn cấp: xử lý trong 24h\n💡 Theo dõi tiến độ qua "Lịch sử phản hồi"!';
    }
    
    // Rules & regulations
    if (msg.includes('quy định') || msg.includes('nội quy') || msg.includes('giờ giấc')) {
      return 'Nội quy chung:\n🚪 Giờ vào cổng: Trước 23h\n🔇 Không gây ồn sau 22h\n🚭 Không hút thuốc trong phòng\n🐕 Không nuôi thú cưng\n👥 Không tụ tập đông người\n📋 Vi phạm có thể bị phạt hoặc chấm dứt HĐ!';
    }
    
    if (msg.includes('giờ') || msg.includes('thời gian') || msg.includes('làm việc')) {
      return 'Giờ làm việc:\n⏰ Văn phòng: 8h - 18h (T2-T6)\n🚪 Ra vào: 5h - 23h\n🔇 Giờ yên tĩnh: Sau 22h\n☎️ Hotline khẩn cấp: 24/7\n� Liên hệ trước nếu về muộn!';
    }
    
    // Check-out / moving out
    if (msg.includes('trả phòng') || msg.includes('chuyển đi') || msg.includes('dọn đi')) {
      return 'Quy trình trả phòng:\n📝 Thông báo trước 1 tháng\n🧹 Vệ sinh sạch sẽ\n🔌 Thanh toán hết hóa đơn\n🔑 Trả chìa khóa\n💰 Nhận lại tiền cọc (nếu hợp lệ)\n💡 Dùng tính năng "Trả phòng" trong hệ thống!';
    }
    
    // Contact
    if (msg.includes('liên hệ') || msg.includes('hotline') || msg.includes('số điện thoại')) {
      return 'Thông tin liên hệ:\n📞 Hotline: 0987-654-321\n📧 Email: quanlynhatro@example.com\n🏢 Văn phòng: Tầng 1, Tòa nhà chính\n⏰ Làm việc: 8h-18h (T2-T6)\n🆘 Khẩn cấp: 24/7\n💡 Hoặc chat trực tiếp với chủ trọ trong hệ thống!';
    }
    
    // Thanks
    if (msg.includes('cảm ơn') || msg.includes('thank')) {
      return 'Rất vui được hỗ trợ bạn! 😊 Nếu còn thắc mắc gì, đừng ngại hỏi nhé. Chúc bạn có trải nghiệm thuê trọ tuyệt vời! 🌟';
    }
    
    // Default response with suggestions
    return '🤔 Xin lỗi, tôi chưa hiểu câu hỏi của bạn.\n\n💡 Bạn có thể hỏi về:\n• Giá phòng và dịch vụ\n• Thanh toán hóa đơn\n• Gửi phản hồi/khiếu nại\n• Quy định và nội quy\n• Thông tin liên hệ\n\nHoặc liên hệ trực tiếp với chủ trọ qua hotline! 📞';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Simulate bot typing
    setTimeout(() => {
      const botMsg = {
        type: 'bot',
        text: getResponse(inputMessage),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div
        ref={buttonRef}
        className={`chatbot-button ${isDragging ? 'dragging' : ''} ${isOpen ? 'hidden' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(true)}
      >
        <FaRobot />
        <span className="pulse-ring"></span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-info">
              <FaRobot className="header-icon" />
              <div>
                <h4>Trợ lý ảo</h4>
                <span className="status">● Trực tuyến</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <FaPaperPlane />
            </button>
          </div>

          <div className="chatbot-quick-questions">
            <button onClick={() => setInputMessage('Giá phòng bao nhiêu?')}>
              💰 Giá phòng
            </button>
            <button onClick={() => setInputMessage('Cách thanh toán?')}>
              💳 Thanh toán
            </button>
            <button onClick={() => setInputMessage('Gửi phản hồi như thế nào?')}>
              � Phản hồi
            </button>
            <button onClick={() => setInputMessage('Quy định chung?')}>
              📋 Nội quy
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
