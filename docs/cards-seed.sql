--
-- PostgreSQL database dump
--

-- Dumped from database version 13.9 (Ubuntu 13.9-1.pgdg20.04+1)
-- Dumped by pg_dump version 14.9 (Ubuntu 14.9-0ubuntu0.22.04.1)

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

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: cube; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS cube WITH SCHEMA public;


--
-- Name: EXTENSION cube; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION cube IS 'data type for multidimensional cubes';


--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA public;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: dict_int; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dict_int WITH SCHEMA public;


--
-- Name: EXTENSION dict_int; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dict_int IS 'text search dictionary template for integers';


--
-- Name: dict_xsyn; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dict_xsyn WITH SCHEMA public;


--
-- Name: EXTENSION dict_xsyn; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dict_xsyn IS 'text search dictionary template for extended synonym processing';


--
-- Name: earthdistance; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS earthdistance WITH SCHEMA public;


--
-- Name: EXTENSION earthdistance; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION earthdistance IS 'calculate great-circle distances on the surface of the Earth';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: intarray; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA public;


--
-- Name: EXTENSION intarray; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION intarray IS 'functions, operators, and index support for 1-D arrays of integers';


--
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: EXTENSION ltree; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION ltree IS 'data type for hierarchical tree-like structures';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgrowlocks; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgrowlocks WITH SCHEMA public;


--
-- Name: EXTENSION pgrowlocks; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgrowlocks IS 'show row-level locking information';


--
-- Name: pgstattuple; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgstattuple WITH SCHEMA public;


--
-- Name: EXTENSION pgstattuple; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgstattuple IS 'show tuple-level statistics';


--
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA public;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: xml2; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS xml2 WITH SCHEMA public;


--
-- Name: EXTENSION xml2; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION xml2 IS 'XPath querying and XSLT';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sbxjfxrw
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO sbxjfxrw;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sbxjfxrw
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO sbxjfxrw;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbxjfxrw
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: walletcards; Type: TABLE; Schema: public; Owner: sbxjfxrw
--

CREATE TABLE public.walletcards (
    id integer NOT NULL,
    username_id integer,
    name character varying(100) NOT NULL,
    bankname character varying(50) NOT NULL,
    last4 character varying(25) NOT NULL,
    brand character varying(25),
    pm_id character varying(50) NOT NULL,
    addr_name character varying(50) NOT NULL,
    addr_line1 character varying(100) NOT NULL,
    addr_line2 character varying(100) NOT NULL,
    card_color character varying(50) NOT NULL,
    logo_color character varying(50) NOT NULL,
    text_color character varying(50) NOT NULL,
    index integer,
    exp character varying(10)
);


ALTER TABLE public.walletcards OWNER TO sbxjfxrw;

--
-- Name: walletcards_id_seq; Type: SEQUENCE; Schema: public; Owner: sbxjfxrw
--

CREATE SEQUENCE public.walletcards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.walletcards_id_seq OWNER TO sbxjfxrw;

--
-- Name: walletcards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sbxjfxrw
--

ALTER SEQUENCE public.walletcards_id_seq OWNED BY public.walletcards.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: walletcards id; Type: DEFAULT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.walletcards ALTER COLUMN id SET DEFAULT nextval('public.walletcards_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sbxjfxrw
--

COPY public.users (id, username, password) FROM stdin;
22	cereal	$2b$12$NIAhv92tCfTbeRCjSQUbM.fDp..1VOOwzOMtVW49xqvc0SxMX7uu.
23	authors	$2b$12$4jzL7Cl8zbDvJsJDT38BDODOHbolxS.4yWiWK422se2ExcsCIbLJG
24	music	$2b$12$qXYULFtXmNj4UHAN1av/guHLvDMv/uha3PSMCA8J13ymUgDmb.Qlu
\.


--
-- Data for Name: walletcards; Type: TABLE DATA; Schema: public; Owner: sbxjfxrw
--

COPY public.walletcards (id, username_id, name, bankname, last4, brand, pm_id, addr_name, addr_line1, addr_line2, card_color, logo_color, text_color, index, exp) FROM stdin;
144	23	JULES VERNE	Truist	1117	discover	pm_1PDpjNBKOM7KLRhMJWzqordU	Jules Verne			rgb(117, 117, 117)	rgb(191, 191, 191)	white	0	12/27
149	23	ISAAC ASIMOV	Citibank	-1			Isaac Asimov			rgb(77, 0, 0)	rgb(255, 102, 102)	white	3	
145	23	LEWIS CARROLL	Costco	4242	visa	pm_1PDpgHBKOM7KLRhMdUGh8pbL	Lewis Carroll			rgb(87, 87, 87)	rgb(255, 0, 0)	white	2	8/28
143	23	JONATHAN SWIFT	Sandy Spring	4444	mastercard	pm_1PDpl1BKOM7KLRhMYd0kfpR1	Jonathan Swift			rgb(0, 38, 77)	rgb(191,191,191)	white	1	2/29
140	22	FRANKENBERRY	General Mills	4444	mastercard	pm_1PDpZoBKOM7KLRhMgZsrmdrx	Frankenberry			rgb(255, 153, 153)	rgb(255, 0, 0)	black	2	4/26
138	22	CHERRIOS	General Mills	4444	mastercard	pm_1PDpX2BKOM7KLRhMCNJOlupO	Cherrios			rgb(234, 234, 0)	rgb(38, 38, 38)	black	0	2/28
141	22	FROSTED FLAKES	Kellogg's	4242	visa	pm_1PDpYdBKOM7KLRhMPLlGnrUW	Frosted Flakes			rgb(0, 113, 224)	rgb(224, 113, 0)	white	4	7/27
142	22	CAP'N CRUNCH	Quaker	-1			Captain Crunch			rgb(255, 127, 87)	rgb(255, 255, 255)	black	3	
139	22	APPLE JACKS	Kellogg's	1117	discover	pm_1PDpZLBKOM7KLRhM9PK3TpRJ	Apple Jacks			rgb(0, 255, 0)	rgb(184, 99, 86)	black	1	11/27
150	24	J S BACH	Clef Bank One	4444	mastercard	pm_1PDvMCBKOM7KLRhMo6UfY8ul	J S Bach			rgb(77, 0, 0)	rgb(153, 204, 255)	white	0	2/29
151	24	CLAUDE DEBUSSY	Treble Bank	-1			Claude Debussy			rgb(0, 51, 0)	rgb(76, 179, 76)	white	1	
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbxjfxrw
--

SELECT pg_catalog.setval('public.users_id_seq', 24, true);


--
-- Name: walletcards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sbxjfxrw
--

SELECT pg_catalog.setval('public.walletcards_id_seq', 151, true);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: walletcards walletcards_pkey; Type: CONSTRAINT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.walletcards
    ADD CONSTRAINT walletcards_pkey PRIMARY KEY (id);


--
-- Name: walletcards walletcards_username_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sbxjfxrw
--

ALTER TABLE ONLY public.walletcards
    ADD CONSTRAINT walletcards_username_id_fkey FOREIGN KEY (username_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

