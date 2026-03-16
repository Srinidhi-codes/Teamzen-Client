
"use client";

export type MessagePart = {
    type: 'text' | 'balance' | 'attendance' | 'error' | 'insight' | 'leavetype' | 'pendingleave';
    value: any;
};

export const useMessageParser = (content: string) => {
    // Regex to find cards
    const balanceRegex = /\[BALANCE_CARD\]([\s\S]*?)\[\/BALANCE_CARD\]/g;
    const attendanceRegex = /\[ATTENDANCE_CARD\]([\s\S]*?)\[\/ATTENDANCE_CARD\]/g;
    const errorRegex = /\[ERROR_CARD\]([\s\S]*?)\[\/ERROR_CARD\]/g;
    const insightRegex = /\[INSIGHT_CARD\]([\s\S]*?)\[\/INSIGHT_CARD\]/g;
    const leaveTypeRegex = /\[LEAVE_TYPE_CARD\]([\s\S]*?)\[\/LEAVE_TYPE_CARD\]/g;
    const pendingLeaveRegex = /\[PENDING_LEAVE_CARD\]([\s\S]*?)\[\/PENDING_LEAVE_CARD\]/g;

    const parts: MessagePart[] = [];
    let lastIndex = 0;

    // Combined parsing logic
    const allMatches: any[] = [];

    let match;
    while ((match = balanceRegex.exec(content)) !== null) {
        allMatches.push({ type: 'balance', index: match.index, lastIndex: balanceRegex.lastIndex, data: match[1] });
    }
    while ((match = attendanceRegex.exec(content)) !== null) {
        allMatches.push({ type: 'attendance', index: match.index, lastIndex: attendanceRegex.lastIndex, data: match[1] });
    }
    while ((match = errorRegex.exec(content)) !== null) {
        allMatches.push({ type: 'error', index: match.index, lastIndex: errorRegex.lastIndex, data: match[1] });
    }
    while ((match = insightRegex.exec(content)) !== null) {
        allMatches.push({ type: 'insight', index: match.index, lastIndex: insightRegex.lastIndex, data: match[1] });
    }
    while ((match = leaveTypeRegex.exec(content)) !== null) {
        allMatches.push({ type: 'leavetype', index: match.index, lastIndex: leaveTypeRegex.lastIndex, data: match[1] });
    }
    while ((match = pendingLeaveRegex.exec(content)) !== null) {
        allMatches.push({ type: 'pendingleave', index: match.index, lastIndex: pendingLeaveRegex.lastIndex, data: match[1] });
    }

    allMatches.sort((a, b) => a.index - b.index);

    allMatches.forEach(m => {
        if (m.index > lastIndex) {
            parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
        }

        const data: any = {};
        m.data.trim().split('|').forEach((part: string) => {
            const firstColonIndex = part.indexOf(':');
            if (firstColonIndex !== -1) {
                const key = part.slice(0, firstColonIndex).trim();
                const val = part.slice(firstColonIndex + 1).trim();
                data[key.toLowerCase()] = val;
            }
        });

        parts.push({ type: m.type, value: data });
        lastIndex = m.lastIndex;
    });

    if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.slice(lastIndex) });
    }

    return parts;
};
