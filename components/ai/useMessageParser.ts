
"use client";

export type MessagePart = {
    type: 'text' | 'balance' | 'attendance' | 'error' | 'insight' | 'leavetype' | 'pendingleave';
    value: any;
};

export const useMessageParser = (content: string) => {
    // Regex to find cards
    const cardTypes = [
        { type: 'balance', start: '[BALANCE_CARD]', end: '[/BALANCE_CARD]' },
        { type: 'attendance', start: '[ATTENDANCE_CARD]', end: '[/ATTENDANCE_CARD]' },
        { type: 'error', start: '[ERROR_CARD]', end: '[/ERROR_CARD]' },
        { type: 'insight', start: '[INSIGHT_CARD]', end: '[/INSIGHT_CARD]' },
        { type: 'leavetype', start: '[LEAVE_TYPE_CARD]', end: '[/LEAVE_TYPE_CARD]' },
        { type: 'pendingleave', start: '[PENDING_LEAVE_CARD]', end: '[/PENDING_LEAVE_CARD]' }
    ];

    const parts: MessagePart[] = [];
    let lastIndex = 0;
    const allMatches: any[] = [];

    // First, find all COMPLETE cards
    cardTypes.forEach(({ type, start, end }) => {
        const regex = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
        let match;
        while ((match = regex.exec(content)) !== null) {
            allMatches.push({ type, index: match.index, lastIndex: regex.lastIndex, data: match[1] });
        }
    });

    // Check for a PARTIAL card at the very end (common during streaming)
    let partialMatch: any = null;
    cardTypes.forEach(({ type, start, end }) => {
        const startIndex = content.lastIndexOf(start);
        if (startIndex > -1 && startIndex >= lastIndex) {
            // Check if this start tag has a corresponding end tag later in the content
            const hasEnd = content.indexOf(end, startIndex) > -1;
            if (!hasEnd) {
                // If it's a newer partial card than any we've found
                if (!partialMatch || startIndex > partialMatch.index) {
                    partialMatch = { 
                        type, 
                        index: startIndex, 
                        lastIndex: content.length, 
                        data: content.slice(startIndex + start.length) 
                    };
                }
            }
        }
    });

    if (partialMatch) {
         // Filter out any full matches that are actually inside or after the partial start
         // (though usually partial is at the very end)
         allMatches.push(partialMatch);
    }

    allMatches.sort((a, b) => a.index - b.index);

    // Dedup: Ensure matches don't overlap (prioritize earlier matches)
    const finalMatches: any[] = [];
    let currentLastIndex = 0;
    allMatches.forEach(m => {
        if (m.index >= currentLastIndex) {
            finalMatches.push(m);
            currentLastIndex = m.lastIndex;
        }
    });

    finalMatches.forEach(m => {
        if (m.index > lastIndex) {
            parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
        }

        const data: any = {};
        const contentData = m.data.trim();
        const fieldRegex = /(title|message|type|stats|topic|Name|Total|Used|Available|description|availability|id|Action|Status|Time|Office|from|to|duration|reason):\s*/gi;
        let fieldMatch;
        let lastKey = '';
        let lastIdx = 0;

        while ((fieldMatch = fieldRegex.exec(contentData)) !== null) {
            if (lastKey) {
                data[lastKey] = contentData.slice(lastIdx, fieldMatch.index).trim().replace(/^\|+|\|+$/g, '').trim();
            }
            lastKey = fieldMatch[1].toLowerCase();
            lastIdx = fieldMatch.index + fieldMatch[0].length;
        }
        if (lastKey) {
            data[lastKey] = contentData.slice(lastIdx).trim().replace(/^\|+|\|+$/g, '').trim();
        }

        parts.push({ type: m.type as any, value: data });
        lastIndex = m.lastIndex;
    });

    if (lastIndex < content.length) {
        parts.push({ type: 'text', value: content.slice(lastIndex) });
    }

    return parts;
};
