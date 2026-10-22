import type { LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData } from "react-router";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Live chat and AI support for your Shopify store</h1>
        <p className={styles.text}>
          Chatlivo adds a chat widget to your storefront so you can answer
          shoppers in real time, from one shared inbox.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Storefront chat widget</strong>. Switch on the Chatlivo embed in your theme editor and start chatting with visitors on every page.
          </li>
          <li>
            <strong>AI chatbot</strong>. Answer common questions automatically, around the clock, and hand off to your team when needed.
          </li>
          <li>
            <strong>One inbox</strong>. Manage website chats and WhatsApp conversations together in your Chatlivo dashboard.
          </li>
        </ul>
      </div>
    </div>
  );
}
