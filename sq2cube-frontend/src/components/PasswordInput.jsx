import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-group">
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle-btn"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <Eye size={18} strokeWidth={2} aria-hidden />
          ) : (
            <EyeOff size={18} strokeWidth={2} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
