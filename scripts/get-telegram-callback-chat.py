#!/usr/bin/env python3
"""Read-only group verification. Never stores/prints token, messages or webhook URL."""
import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

class BotAPIError(Exception):
    def __init__(self, code):
        self.code = code

def api(token, method, payload=None):
    request = urllib.request.Request(
        'https://api.telegram.org/bot' + token + '/' + method,
        data=json.dumps(payload or {}).encode(),
        headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        raise BotAPIError(error.code) from None
    except Exception:
        raise BotAPIError('network') from None
    if body.get('ok') is not True:
        raise BotAPIError(body.get('error_code', 'unconfirmed'))
    return body.get('result')

def matching_groups(updates, title):
    matches = {}
    for update in updates:
        for field in ('message', 'edited_message', 'channel_post', 'my_chat_member', 'chat_member'):
            chat = (update.get(field) or {}).get('chat') or {}
            if chat.get('type') in ('group', 'supergroup') and chat.get('title', '').strip() == title.strip():
                if isinstance(chat.get('id'), int):
                    matches[chat['id']] = chat.get('title')
    return matches

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--group', default='Recall')
    parser.add_argument('--bot-name', default=None)
    args = parser.parse_args()
    token = os.environ.get('TELEGRAM_CALLBACK_BOT_TOKEN', '').strip()
    if not token:
        if not sys.stdin.isatty():
            print('Chưa có token trong môi trường. Chạy script trực tiếp trong Terminal để nhập token ẩn. Không gửi token qua chat.')
            return 2
        token = getpass.getpass('Telegram Bot Token (nhập ẩn, không lưu): ').strip()
    if not token:
        print('Chưa nhập token; không gọi Bot API.')
        return 2
    try:
        me = api(token, 'getMe')
        if args.bot_name and (me or {}).get('first_name') != args.bot_name:
            print('Tên bot không khớp bot dự kiến; dừng để tránh cấu hình nhầm.')
            return 2
        info = api(token, 'getWebhookInfo')
        if (info or {}).get('url'):
            print('Bot đang có webhook. Đã dừng; không gọi getUpdates, không xóa hoặc đổi webhook.')
            print('Nhờ người quản lý webhook lấy chat.id từ bản cập nhật của đúng nhóm và đối chiếu bằng getChat.')
            return 3
        # No offset or allowed_updates: do not acknowledge updates/change subscriptions.
        updates = api(token, 'getUpdates', {'timeout': 0, 'limit': 100})
        matches = matching_groups(updates or [], args.group)
        if len(matches) != 1:
            print('Chưa tìm được đúng một nhóm trùng tên. Gửi lệnh /callback_setup vào nhóm có bot rồi chạy lại một lần.')
            if len(matches) > 1:
                print('Có nhiều nhóm trùng tên; cần xác định nhóm trước khi cấu hình.')
            return 4
        chat_id = next(iter(matches))
        verified = api(token, 'getChat', {'chat_id': chat_id})
        if verified.get('title', '').strip() != args.group.strip() or verified.get('type') not in ('group', 'supergroup'):
            print('getChat chưa xác nhận đúng nhóm; không cấu hình.')
            return 4
        print('Đã xác minh bằng getUpdates và getChat: ' + verified['title'])
        print('TELEGRAM_CALLBACK_CHAT_ID=' + str(chat_id))
        print('Chỉ lưu ID này vào Supabase Secrets sau khi xác nhận khác nơi nhận thông báo thanh toán.')
        return 0
    except BotAPIError as error:
        print('Bot API chưa xác nhận được, mã: ' + str(error.code) + '. Không thay đổi webhook hoặc gửi tin.')
        if error.code == 409:
            print('Có thể bot đang được webhook/poller khác sử dụng. Nhờ người quản lý bot cung cấp chat.id đã xác minh.')
        return 5

if __name__ == '__main__':
    raise SystemExit(main())
