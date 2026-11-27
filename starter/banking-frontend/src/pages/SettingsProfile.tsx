import { useState } from "react";
import { ApiError, fieldError } from "../api/client";
import { useUpdateCustomer } from "../api/customer";
import type { Schemas } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { TextField } from "../components/Field";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { ErrorTile } from "../components/QueryState";
import styles from "./SettingsPage.module.css";

type Customer = Schemas["Customer"];
type Address = Schemas["Address"];
type Editing = "email" | "mobile" | "address" | null;

/** "Contact information" card. Each value has a pencil that opens a small edit dialog. */
export function ContactCard({ customer }: { customer: Customer }) {
  const [editing, setEditing] = useState<Editing>(null);
  const a = customer.address;
  return (
    <Card title="Contact information">
      <Row label="E-mail address" onEdit={() => setEditing("email")}>
        {customer.email}
      </Row>
      <Row label="Mobile number" onEdit={() => setEditing("mobile")}>
        {customer.mobile}
      </Row>
      <Row label="Address" onEdit={() => setEditing("address")}>
        <div>{a.street}</div>
        <div>
          {a.zip} {a.city}
        </div>
        <div>{a.country}</div>
      </Row>
      <EditDialog editing={editing} customer={customer} onClose={() => setEditing(null)} />
    </Card>
  );
}

function Row({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{children}</span>
      <button type="button" className={styles.edit} onClick={onEdit} aria-label={`Edit ${label}`}>
        <Icon name="edit" size={24} />
      </button>
    </div>
  );
}

const TITLES = { email: "E-mail address", mobile: "Mobile number", address: "Address" } as const;

function EditDialog({ editing, customer, onClose }: { editing: Editing; customer: Customer; onClose: () => void }) {
  return (
    <Modal
      title={editing ? `Edit ${TITLES[editing].toLowerCase()}` : ""}
      open={editing !== null}
      onClose={onClose}
      width={520}
    >
      {editing && <EditForm key={editing} field={editing} customer={customer} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({
  field,
  customer,
  onClose,
}: {
  field: NonNullable<Editing>;
  customer: Customer;
  onClose: () => void;
}) {
  const update = useUpdateCustomer();
  const [text, setText] = useState(field === "address" ? "" : customer[field]);
  const [address, setAddress] = useState<Address>(customer.address);
  const errorFor = (key: string) => fieldError(update.error, key);

  const save = () => update.mutate(field === "address" ? { address } : { [field]: text }, { onSuccess: onClose });
  const setPart = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress({ ...address, [key]: e.target.value });

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {field === "address" ? (
        <>
          <TextField
            label="Street and number"
            value={address.street}
            onChange={setPart("street")}
            error={errorFor("street")}
          />
          <TextField label="ZIP" value={address.zip} onChange={setPart("zip")} error={errorFor("zip")} />
          <TextField label="City" value={address.city} onChange={setPart("city")} error={errorFor("city")} />
          <TextField
            label="Country (ISO code)"
            value={address.country}
            onChange={setPart("country")}
            error={errorFor("country")}
          />
        </>
      ) : (
        <TextField
          label={TITLES[field]}
          value={text}
          onChange={(e) => setText(e.target.value)}
          error={errorFor(field)}
          autoFocus
        />
      )}
      {update.error && !(update.error instanceof ApiError && update.error.details.length) && (
        <ErrorTile message={update.error.message} />
      )}
      <div>
        <Button type="submit" disabled={update.isPending}>
          Save
        </Button>{" "}
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
