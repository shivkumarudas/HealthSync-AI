/**
 * HealthSync AI — AI Health Chatbot JS
 */

let chatHistory = JSON.parse(localStorage.getItem('hs_chat_history') || '[]');
let isLoading = false;

// Restore chat history from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    if (chatHistory.length > 0) {
        // Restore existing messages (skip the first welcome message rendering)
        chatHistory.forEach(msg => {
            if (msg.role !== 'welcome') appendMessage(msg.role, msg.content, false);
        });
        scrollToBottom(document.getElementById('chat-messages'));
    }

    // Focus input
    const input = document.getElementById('chat-input');
    if (input) input.focus();
});

function handleChatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    if (isLoading) return;

    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    autoResize(input);

    // Hide quick questions after first message
    document.getElementById('quick-questions')?.style.setProperty('display', 'none');

    appendMessage('user', message, true);
    showTypingIndicator();

    isLoading = true;
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;

    try {
        const data = await apiPost('/api/chat', { message });
        hideTypingIndicator();
        appendMessage('ai', data.response, true);
    } catch (err) {
        hideTypingIndicator();
        appendMessage('ai', '❌ Sorry, I encountered an error: ' + err.message + '. Please try again.', true);
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function sendQuickMessage(msg) {
    document.getElementById('chat-input').value = msg;
    sendMessage();
}

function appendMessage(role, content, save = true) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 animate-fade-in';

    const isUser = role === 'user';
    const avatar = isUser
        ? `<div class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">U</div>`
        : `<div class="w-8 h-8 rounded-full bg-primary-900 border border-primary-700 flex items-center justify-center text-sm flex-shrink-0">🩺</div>`;

    const bubble = isUser
        ? `<div class="chat-bubble-user"><p class="text-sm">${escapeHtml(content)}</p></div>`
        : `<div class="chat-bubble-ai"><p class="font-medium text-primary-400 text-xs mb-1">HealthSync AI</p><div class="markdown-output text-sm">${renderMarkdown(content)}</div></div>`;

    if (isUser) {
        div.innerHTML = `<div class="flex-1"></div>${bubble}${avatar}`;
    } else {
        div.innerHTML = `${avatar}${bubble}`;
    }

    container.appendChild(div);
    scrollToBottom(container);

    // Save to localStorage
    if (save) {
        chatHistory.push({ role, content });
        // Keep only last 50 messages
        if (chatHistory.length > 50) chatHistory = chatHistory.slice(-50);
        localStorage.setItem('hs_chat_history', JSON.stringify(chatHistory));
    }
}

function showTypingIndicator() {
    document.getElementById('typing-indicator').classList.remove('hidden');
    scrollToBottom(document.getElementById('chat-messages'));
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator').classList.add('hidden');
}

function clearChat() {
    chatHistory = [];
    localStorage.removeItem('hs_chat_history');
    const container = document.getElementById('chat-messages');
    // Keep only the first welcome message div
    const messages = container.querySelectorAll('.flex.items-start');
    messages.forEach((el, i) => { if (i > 0) el.remove(); });
    document.getElementById('quick-questions')?.style.removeProperty('display');
    showToast('Chat cleared', 'info');
}
