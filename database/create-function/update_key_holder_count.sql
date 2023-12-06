begin
  IF old.last_fetched_balance = 0 AND new.last_fetched_balance > 0 THEN
    update krews
    set
      key_holder_count = key_holder_count + 1
    where
      id = new.krew;
  ELSIF old.last_fetched_balance > 0 AND new.last_fetched_balance = 0 THEN
    update krews
    set
      key_holder_count = key_holder_count - 1
    where
      id = new.krew;
  END IF;
  return null;
end;