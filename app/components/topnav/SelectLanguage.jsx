import React from "react";
import { Form, useSubmit } from "@remix-run/react";

const SelectLanguage = ({ locale, languages }) => {
  const submit = useSubmit();

  return (
    <div className="float-right ml-2 relative top-[-0.6rem] right-[-0.6rem]">
      <Form>
        <select
          className="px-2 text-gray-700"
          value={locale}
          onChange={(event) => {
            submit(null, {
              method: "post",
              action: `/${event.target.value}/posts/all`
            });
          }}
        >
          {languages.map(({ label, value }) =>
            <option key={value} value={value}>{label}</option>
          )}
        </select>
      </Form>
    </div>
  );
};

export default SelectLanguage;
