create trigger purchase_requests_telegram_insert
  after insert on public.purchase_requests
  for each row execute function telegram_private.after_purchase_insert();
