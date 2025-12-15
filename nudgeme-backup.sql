--
-- PostgreSQL database dump
--

\restrict O9T6xHskfTsdq0QZdwi15rX8sfqsxzEp7cx8gcII8zdrPL3rJrZI5eJawORkcb4

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: reminders; Type: TABLE; Schema: public; Owner: nudgeme
--

CREATE TABLE public.reminders (
    id integer NOT NULL,
    info text NOT NULL,
    createddate timestamp without time zone NOT NULL,
    lastreminded timestamp without time zone,
    gapmins bigint NOT NULL
);


ALTER TABLE public.reminders OWNER TO nudgeme;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: nudgeme
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reminders_id_seq OWNER TO nudgeme;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nudgeme
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: nudgeme
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: nudgeme
--

COPY public.reminders (id, info, createddate, lastreminded, gapmins) FROM stdin;
1	test	2025-12-14 07:17:32.948438	\N	0
2	Test	2025-12-15 11:55:53.62156	\N	0
\.


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nudgeme
--

SELECT pg_catalog.setval('public.reminders_id_seq', 2, true);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: nudgeme
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict O9T6xHskfTsdq0QZdwi15rX8sfqsxzEp7cx8gcII8zdrPL3rJrZI5eJawORkcb4

