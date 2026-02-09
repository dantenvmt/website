// src/utils/guestSession.js
import { v4 as uuidv4 } from 'uuid';

export const getGuestId = () => {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
        guestId = `guest_${uuidv4()}`;
        localStorage.setItem('guest_id', guestId);
    }
    return guestId;
};