SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict wN5ALmLR07qazmCzUk6UWld4u2hibiEIqVYACxh2NzuPMzc5VZ8McXD6RkA5WgC

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	aa61599b-fd8d-4c87-9e7a-14874579dcb7	authenticated	authenticated	marianarodeso@gmail.com	$2a$10$OL5vjwW4FwZlnGZUCJLJ7.5GTAG8IH9S6o.M1IC0s4RoUYMLAV46W	2026-08-03 21:27:36.527049+00	\N		\N	57c561a6a76f0d121572e8e76bc5bf83b753d1386a0b0100fb6c123e	2026-09-09 17:16:06.887987+00			\N	2026-08-12 19:05:53.317788+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-03 21:27:36.517225+00	2026-09-17 17:21:26.378444+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7c09300d-d6be-41b1-aebe-3d856ac971dc	authenticated	authenticated	mbramoc@gmail.com	$2a$10$BKtPQUANyS3e1hz8Km2CGeJycB5VdgrSi7AFJQGprSxoj1t0lL2Qy	2026-08-04 04:01:55.953398+00	\N		\N		\N			\N	2026-08-07 05:49:39.283141+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-04 04:01:55.935907+00	2026-08-07 05:49:39.291539+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	532b3f7a-5968-47e6-89db-562abb75fc84	authenticated	authenticated	riggermaia@gmail.com	$2a$10$AI7Xx8kFcfGx/bCM0q3nbe.t6hDUCH2xf36B00MeSXPzG9JNoNbvm	2026-08-06 22:37:26.39217+00	\N		\N		\N			\N	2026-08-07 06:37:44.797277+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-06 22:37:26.378984+00	2026-08-07 06:37:44.799733+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d25b6046-8cd6-48e5-b8f2-78373bc1818c	authenticated	authenticated	leo.zerino@gmail.com	$2a$10$h1Jv/P5fIKKaGef7weIGue0WK8CqA.liV6uUlA3/qDB2pHWPvPEC2	2026-07-23 08:00:44.906725+00	\N		\N		\N			\N	2026-09-25 04:57:55.294943+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-07-23 08:00:44.881097+00	2026-09-29 05:19:49.660183+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
d25b6046-8cd6-48e5-b8f2-78373bc1818c	d25b6046-8cd6-48e5-b8f2-78373bc1818c	{"sub": "d25b6046-8cd6-48e5-b8f2-78373bc1818c", "email": "leo.zerino@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-07-23 08:00:44.8991+00	2026-07-23 08:00:44.899173+00	2026-07-23 08:00:44.899173+00	aedfba72-8757-4db6-98ae-5f0c8393fc45
aa61599b-fd8d-4c87-9e7a-14874579dcb7	aa61599b-fd8d-4c87-9e7a-14874579dcb7	{"sub": "aa61599b-fd8d-4c87-9e7a-14874579dcb7", "email": "marianarodeso@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-03 21:27:36.524824+00	2026-08-03 21:27:36.524897+00	2026-08-03 21:27:36.524897+00	77004501-264e-4029-bf10-d2253eed298e
7c09300d-d6be-41b1-aebe-3d856ac971dc	7c09300d-d6be-41b1-aebe-3d856ac971dc	{"sub": "7c09300d-d6be-41b1-aebe-3d856ac971dc", "email": "mbramoc@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-04 04:01:55.949633+00	2026-08-04 04:01:55.949692+00	2026-08-04 04:01:55.949692+00	716706cb-4d52-4463-9858-4e3eda87ee6a
532b3f7a-5968-47e6-89db-562abb75fc84	532b3f7a-5968-47e6-89db-562abb75fc84	{"sub": "532b3f7a-5968-47e6-89db-562abb75fc84", "email": "riggermaia@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-06 22:37:26.389232+00	2026-08-06 22:37:26.389289+00	2026-08-06 22:37:26.389289+00	852989bb-48b4-42eb-a7dd-f73d58cd197b
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
69f60409-6fba-410f-b71b-ba83e93fd2b3	aa61599b-fd8d-4c87-9e7a-14874579dcb7	2026-08-12 19:05:53.318503+00	2026-08-18 13:15:07.546097+00	\N	aal1	\N	2026-08-18 13:15:07.545975	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	189.120.73.105	\N	\N	\N	\N	\N
e9088f9b-4821-41a7-b798-c586f848fea9	aa61599b-fd8d-4c87-9e7a-14874579dcb7	2026-08-12 19:05:02.802115+00	2026-08-12 19:05:02.802115+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36	187.70.4.121	\N	\N	\N	\N	\N
66c0c652-6542-44e6-a084-b787944503c5	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-10 06:44:29.421392+00	2026-09-16 20:43:15.712355+00	\N	aal1	\N	2026-09-16 20:43:15.71225	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	177.140.104.161	\N	\N	\N	\N	\N
668fd03e-d4f9-4cda-9f26-2102eb95850c	aa61599b-fd8d-4c87-9e7a-14874579dcb7	2026-08-10 07:04:08.044406+00	2026-09-17 17:21:26.388553+00	\N	aal1	\N	2026-09-17 17:21:26.388433	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0	177.140.104.161	\N	\N	\N	\N	\N
120d6020-3c8e-46ce-bfe9-b28f6863898b	7c09300d-d6be-41b1-aebe-3d856ac971dc	2026-08-04 04:24:41.444142+00	2026-08-04 22:23:36.870081+00	\N	aal1	\N	2026-08-04 22:23:36.869967	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1	146.75.191.51	\N	\N	\N	\N	\N
5120afc8-02af-4ac5-8b21-9a7ddb777817	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-16 20:53:39.334284+00	2026-09-18 01:08:32.132278+00	\N	aal1	\N	2026-09-18 01:08:32.132151	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36	181.77.73.22	\N	\N	\N	\N	\N
08e9e635-7b4d-4b9c-9369-7d1641600898	7c09300d-d6be-41b1-aebe-3d856ac971dc	2026-08-07 05:49:39.283232+00	2026-08-07 05:49:39.283232+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0	179.209.47.26	\N	\N	\N	\N	\N
573f0dfd-1be8-4056-b6c0-3f826222e6b4	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-11 08:44:34.597649+00	2026-09-15 19:51:08.37267+00	\N	aal1	\N	2026-09-15 19:51:08.372549	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	179.209.47.26	\N	\N	\N	\N	\N
c04aadce-25c5-44c4-98e3-7eb407a57d81	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-10 05:26:11.729481+00	2026-09-10 05:26:11.729481+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	179.209.47.26	\N	\N	\N	\N	\N
45f2a109-d80b-448e-a730-ce866e1281fd	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-21 13:20:58.008919+00	2026-09-25 04:26:23.890241+00	\N	aal1	\N	2026-09-25 04:26:23.890129	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	179.209.47.26	\N	\N	\N	\N	\N
e0faa1c8-0b56-4ef0-a55d-fce2656a36af	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-25 04:57:55.295101+00	2026-09-25 04:57:55.295101+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	179.209.47.26	\N	\N	\N	\N	\N
7015ba04-fea9-48a9-bb2d-4b34da7cc5b0	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-21 18:23:15.5933+00	2026-09-28 05:49:22.095322+00	\N	aal1	\N	2026-09-28 05:49:22.095224	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36	181.77.74.249	\N	\N	\N	\N	\N
f0fc3207-99de-4983-aeb4-3aec97cff1c8	d25b6046-8cd6-48e5-b8f2-78373bc1818c	2026-09-21 13:25:53.874259+00	2026-09-29 05:19:49.670868+00	\N	aal1	\N	2026-09-29 05:19:49.670764	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	179.209.47.26	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
120d6020-3c8e-46ce-bfe9-b28f6863898b	2026-08-04 04:24:41.487451+00	2026-08-04 04:24:41.487451+00	password	b4218321-d063-40e1-93e7-4c12cb6dea9a
08e9e635-7b4d-4b9c-9369-7d1641600898	2026-08-07 05:49:39.30201+00	2026-08-07 05:49:39.30201+00	password	5bd3956b-2149-4fd2-a7d1-2501420f81f4
668fd03e-d4f9-4cda-9f26-2102eb95850c	2026-08-10 07:04:08.073124+00	2026-08-10 07:04:08.073124+00	password	cdb29c45-90f5-41d5-838c-4ad7bfac9d7b
e9088f9b-4821-41a7-b798-c586f848fea9	2026-08-12 19:05:02.831692+00	2026-08-12 19:05:02.831692+00	otp	3248c90a-ebf2-4731-bea7-bbc9c0023e9b
69f60409-6fba-410f-b71b-ba83e93fd2b3	2026-08-12 19:05:53.335735+00	2026-08-12 19:05:53.335735+00	password	147a3cfb-af66-4961-87f1-b3704aa09817
c04aadce-25c5-44c4-98e3-7eb407a57d81	2026-09-10 05:26:11.747705+00	2026-09-10 05:26:11.747705+00	password	6d24a8d1-6f4d-4bb1-9b95-021a967bac59
66c0c652-6542-44e6-a084-b787944503c5	2026-09-10 06:44:29.455246+00	2026-09-10 06:44:29.455246+00	password	b5eb2dda-bdbf-40ea-b186-2e859d2e28f8
573f0dfd-1be8-4056-b6c0-3f826222e6b4	2026-09-11 08:44:34.63882+00	2026-09-11 08:44:34.63882+00	password	b1b58bb1-69ba-402e-954d-dd372f9b4099
5120afc8-02af-4ac5-8b21-9a7ddb777817	2026-09-16 20:53:39.369792+00	2026-09-16 20:53:39.369792+00	password	516bd556-0e02-4602-8ef1-13d7a06ee58d
45f2a109-d80b-448e-a730-ce866e1281fd	2026-09-21 13:20:58.107602+00	2026-09-21 13:20:58.107602+00	password	28531892-b83d-4095-8761-b62780d6f490
f0fc3207-99de-4983-aeb4-3aec97cff1c8	2026-09-21 13:25:53.883293+00	2026-09-21 13:25:53.883293+00	password	4bc2ed89-aa46-473d-9941-9ee72c2f411f
7015ba04-fea9-48a9-bb2d-4b34da7cc5b0	2026-09-21 18:23:15.656064+00	2026-09-21 18:23:15.656064+00	password	3bcec422-ba32-42b3-8645-00d106edaa65
e0faa1c8-0b56-4ef0-a55d-fce2656a36af	2026-09-25 04:57:55.33576+00	2026-09-25 04:57:55.33576+00	password	afdc6b30-4934-4936-9419-050cbe8f4cd7
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_code_sets" ("id", "user_id", "mfa_factor_id", "failed_verification_count", "verification_locked_until", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_recovery_codes" ("id", "mfa_recovery_code_set_id", "code_hash", "consumed_at", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at", "expires_at") FROM stdin;
a3f5c923-df4b-4dbe-bf9a-9db178e1435f	aa61599b-fd8d-4c87-9e7a-14874579dcb7	recovery_token	57c561a6a76f0d121572e8e76bc5bf83b753d1386a0b0100fb6c123e	marianarodeso@gmail.com	2026-09-09 17:16:08.287744	2026-09-09 17:16:08.287744	\N
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	363	yynaxjcpwg2b	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 04:20:35.030769+00	2026-09-09 05:19:01.927641+00	q3rr5tooa6ku	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	407	3hyayubrvgtg	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 17:46:59.502737+00	2026-09-15 18:45:29.530835+00	syq6b3j7iybr	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	406	heay6shzjqyr	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 17:46:59.502592+00	2026-09-15 18:45:29.530931+00	423b2cnt5uga	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	415	44dn4euuv7f5	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 03:51:22.482339+00	2026-09-16 04:51:02.455265+00	4ujos3j4lvlf	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	411	vmm3wklvk3pl	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 19:51:08.358686+00	2026-09-16 07:06:21.651798+00	uqnptg7wmjtb	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	373	l3lmsw4iredm	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 21:36:42.012001+00	2026-09-10 03:27:11.00234+00	xtmps4abitoz	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	419	reo3yy6jlosu	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-16 07:06:21.662228+00	2026-09-16 16:58:32.355574+00	vmm3wklvk3pl	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	390	cd5dc47tezgg	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-10 06:44:29.437431+00	2026-09-10 07:45:14.358601+00	\N	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	423	lyvo5ij65gfw	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 20:53:39.35749+00	2026-09-16 22:30:43.075637+00	\N	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	395	3ub4pwczw6b6	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-11 08:44:41.72239+00	2026-09-14 18:48:54.752995+00	eahmuuv26aav	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	394	srgkh32h4zjn	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-11 08:44:34.62322+00	2026-09-14 18:48:54.753009+00	\N	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	427	myz5vmtn5xe3	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-17 16:32:04.417401+00	2026-09-17 21:10:27.169296+00	mm5xopbwjxkj	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	401	34o3hqfb7mq4	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 14:51:29.340665+00	2026-09-15 15:49:59.443224+00	jgfwt3mghgww	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	400	qy7mwlejvkns	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 14:51:29.340571+00	2026-09-15 15:49:59.443211+00	clzkn4dlp63t	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	431	febqjlwnhgvm	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-17 23:18:13.395364+00	2026-09-18 01:08:32.115914+00	iorxvcljfkak	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	435	3tus7elu3c45	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 14:20:25.507675+00	2026-09-21 15:18:46.974037+00	eacimbxjjeaq	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	439	2x3hgrlly54e	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 16:22:33.051993+00	2026-09-21 17:20:39.367684+00	dyxnct7u6xs6	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	447	zv7tmleakzop	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-22 20:31:59.655709+00	2026-09-23 20:57:53.520156+00	347tdqrh4xxv	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	443	xr2jvxospie7	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-22 03:45:25.162737+00	2026-09-23 22:40:59.219552+00	mgbmiq6ore2t	7015ba04-fea9-48a9-bb2d-4b34da7cc5b0
00000000-0000-0000-0000-000000000000	451	nf7bsur447hl	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-24 04:14:45.307365+00	2026-09-25 04:20:36.354584+00	t63bay5xfwdg	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	455	igdjpp73ggk6	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-25 04:57:55.320663+00	2026-09-25 04:57:55.320663+00	\N	e0faa1c8-0b56-4ef0-a55d-fce2656a36af
00000000-0000-0000-0000-000000000000	360	jbaqgt3i4lq4	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 01:25:53.65268+00	2026-09-09 02:23:54.182005+00	rfsp56z7lzlo	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	409	r7p2djhlt3t3	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 18:45:29.544495+00	2026-09-15 19:51:08.350838+00	3hyayubrvgtg	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	364	dgwichoi5kv3	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 05:19:01.932728+00	2026-09-09 18:09:44.628765+00	yynaxjcpwg2b	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	412	gbm3o36lepha	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 20:15:24.585375+00	2026-09-15 21:13:29.351338+00	ixtywd42yqqb	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	368	xtmps4abitoz	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 20:36:54.658063+00	2026-09-09 21:36:42.010169+00	krn277y4kow4	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	416	6k7mwtj6qzgj	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 04:51:02.471538+00	2026-09-16 05:49:06.858392+00	44dn4euuv7f5	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	420	jb5qawzf27mu	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-16 16:58:32.367507+00	2026-09-16 20:34:28.772843+00	reo3yy6jlosu	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	244	3eao4tjjgevd	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-12 19:05:53.331349+00	2026-08-13 22:54:26.698126+00	\N	69f60409-6fba-410f-b71b-ba83e93fd2b3
00000000-0000-0000-0000-000000000000	111	vbqobkcwbbkf	7c09300d-d6be-41b1-aebe-3d856ac971dc	t	2026-08-04 04:24:41.461432+00	2026-08-04 22:23:36.853315+00	\N	120d6020-3c8e-46ce-bfe9-b28f6863898b
00000000-0000-0000-0000-000000000000	424	smzvlqvrfiff	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 22:30:43.087947+00	2026-09-17 07:03:58.235165+00	lyvo5ij65gfw	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	123	4gwr4q6nbpb5	7c09300d-d6be-41b1-aebe-3d856ac971dc	f	2026-08-04 22:23:36.858849+00	2026-08-04 22:23:36.858849+00	vbqobkcwbbkf	120d6020-3c8e-46ce-bfe9-b28f6863898b
00000000-0000-0000-0000-000000000000	428	oouweokm26tc	aa61599b-fd8d-4c87-9e7a-14874579dcb7	f	2026-09-17 17:21:26.374231+00	2026-09-17 17:21:26.374231+00	5wraxsnu2ekd	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	432	2qrvxpz4qlm3	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-18 01:08:32.120441+00	2026-09-18 01:08:32.120441+00	febqjlwnhgvm	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	383	2uyakfywhmwi	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-10 03:27:11.002711+00	2026-09-10 05:30:56.196893+00	l3lmsw4iredm	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	436	6y6n2ece3buc	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 14:26:09.152604+00	2026-09-21 15:24:20.205993+00	tt77smq37ykg	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	391	hfr7e3i6ieyi	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-10 07:45:14.369461+00	2026-09-10 08:43:31.825333+00	cd5dc47tezgg	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	440	llzsft6afte3	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 17:20:39.375423+00	2026-09-22 11:11:45.268879+00	2x3hgrlly54e	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	396	vgymspkm7bne	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-14 18:48:54.771676+00	2026-09-15 13:52:59.677974+00	3ub4pwczw6b6	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	397	kvhujpnc7v6v	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-14 18:48:54.771679+00	2026-09-15 13:52:59.677939+00	srgkh32h4zjn	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	444	la2dwenmftd6	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-22 11:11:45.276479+00	2026-09-22 17:34:44.765714+00	llzsft6afte3	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	403	ut4pvfebt4wj	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 15:49:59.448869+00	2026-09-15 16:48:29.399699+00	qy7mwlejvkns	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	402	lm6of4prunf4	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 15:49:59.448852+00	2026-09-15 16:48:29.399732+00	34o3hqfb7mq4	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	448	t63bay5xfwdg	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-23 20:57:53.532407+00	2026-09-24 04:14:45.296077+00	zv7tmleakzop	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	452	ndh6cqp3ifif	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-24 05:37:26.890967+00	2026-09-25 04:26:23.869252+00	jo6nv75if77k	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	243	kberped5wx23	aa61599b-fd8d-4c87-9e7a-14874579dcb7	f	2026-08-12 19:05:02.816085+00	2026-08-12 19:05:02.816085+00	\N	e9088f9b-4821-41a7-b798-c586f848fea9
00000000-0000-0000-0000-000000000000	456	2abkapou5qv6	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-28 05:49:22.078586+00	2026-09-28 05:49:22.078586+00	5ftfx6ddexfy	7015ba04-fea9-48a9-bb2d-4b34da7cc5b0
00000000-0000-0000-0000-000000000000	267	loj22hpaohzs	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-13 22:54:26.703255+00	2026-08-16 13:44:21.374533+00	3eao4tjjgevd	69f60409-6fba-410f-b71b-ba83e93fd2b3
00000000-0000-0000-0000-000000000000	312	upi4ghz2pgpl	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-16 13:44:21.393266+00	2026-08-18 13:15:07.501772+00	loj22hpaohzs	69f60409-6fba-410f-b71b-ba83e93fd2b3
00000000-0000-0000-0000-000000000000	318	tre2d7knqz4e	aa61599b-fd8d-4c87-9e7a-14874579dcb7	f	2026-08-18 13:15:07.520341+00	2026-08-18 13:15:07.520341+00	upi4ghz2pgpl	69f60409-6fba-410f-b71b-ba83e93fd2b3
00000000-0000-0000-0000-000000000000	306	5g2sl2appyes	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-15 04:19:18.557392+00	2026-08-30 13:09:21.648763+00	6goezrj75tex	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	328	kq7kezsrjx5c	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-30 13:09:21.660208+00	2026-09-03 04:24:46.877062+00	5g2sl2appyes	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	404	syq6b3j7iybr	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 16:48:29.405813+00	2026-09-15 17:46:59.491692+00	lm6of4prunf4	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	361	33udqjumyohq	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 02:23:54.188286+00	2026-09-09 03:22:05.139732+00	jbaqgt3i4lq4	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	365	6egkbcucwfvo	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 18:09:44.644088+00	2026-09-09 19:08:03.165902+00	dgwichoi5kv3	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	408	uqnptg7wmjtb	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 18:45:29.544502+00	2026-09-15 19:51:08.350161+00	heay6shzjqyr	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	413	xjjjvsxuvzy3	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 21:13:29.359149+00	2026-09-16 02:52:59.929978+00	gbm3o36lepha	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	417	3b7skvytqyi5	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 05:49:06.870472+00	2026-09-16 06:47:29.168344+00	6k7mwtj6qzgj	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	421	djy2s3j7cfmm	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-16 20:34:28.783066+00	2026-09-17 06:31:43.636947+00	jb5qawzf27mu	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	388	gaphtqyl3b4n	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-10 05:26:11.740257+00	2026-09-10 05:26:11.740257+00	\N	c04aadce-25c5-44c4-98e3-7eb407a57d81
00000000-0000-0000-0000-000000000000	392	bzy74svb7rpi	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-10 08:43:31.838243+00	2026-09-10 09:42:15.933756+00	hfr7e3i6ieyi	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	425	5wraxsnu2ekd	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-17 06:31:43.654728+00	2026-09-17 17:21:26.3681+00	djy2s3j7cfmm	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	158	xlabg4s3wigk	7c09300d-d6be-41b1-aebe-3d856ac971dc	f	2026-08-07 05:49:39.290164+00	2026-08-07 05:49:39.290164+00	\N	08e9e635-7b4d-4b9c-9369-7d1641600898
00000000-0000-0000-0000-000000000000	399	jgfwt3mghgww	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-15 13:52:59.702268+00	2026-09-15 14:51:29.334689+00	kvhujpnc7v6v	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	429	jpmjo7fiz6ui	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-17 21:10:27.187492+00	2026-09-17 22:10:20.264343+00	myz5vmtn5xe3	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	433	eacimbxjjeaq	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 13:20:58.053296+00	2026-09-21 14:20:25.494434+00	\N	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	437	zharo7x7sn2d	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 15:18:46.990889+00	2026-09-21 17:24:26.420215+00	3tus7elu3c45	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	445	cc4jfoasmecu	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-22 17:34:44.784268+00	2026-09-22 18:33:08.020241+00	la2dwenmftd6	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	441	ffpoipdc2hpx	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 17:24:26.424892+00	2026-09-23 20:59:29.561151+00	zharo7x7sn2d	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	449	jo6nv75if77k	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-23 20:59:29.565786+00	2026-09-24 05:37:26.886854+00	ffpoipdc2hpx	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	453	z62uzkuydvbd	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-25 04:20:36.366033+00	2026-09-28 19:33:40.930375+00	nf7bsur447hl	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	457	oycq3kw3xp6p	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-28 19:33:40.938592+00	2026-09-29 05:19:49.639572+00	z62uzkuydvbd	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	184	l5pazgswqa4o	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-10 07:04:08.060791+00	2026-08-14 07:59:07.846758+00	\N	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	292	6goezrj75tex	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-08-14 07:59:07.853952+00	2026-08-15 04:19:18.550055+00	l5pazgswqa4o	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	356	rfsp56z7lzlo	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-08 20:39:21.212436+00	2026-09-09 01:25:53.637582+00	ij6dfyruarrd	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	405	423b2cnt5uga	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 16:48:29.405811+00	2026-09-15 17:46:59.493674+00	ut4pvfebt4wj	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	362	q3rr5tooa6ku	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 03:22:05.144592+00	2026-09-09 04:20:35.025254+00	33udqjumyohq	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	410	jprxlr6x5af2	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-15 19:51:08.358689+00	2026-09-15 19:51:08.358689+00	r7p2djhlt3t3	573f0dfd-1be8-4056-b6c0-3f826222e6b4
00000000-0000-0000-0000-000000000000	366	krn277y4kow4	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-09 19:08:03.170972+00	2026-09-09 20:36:54.649714+00	6egkbcucwfvo	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	393	ixtywd42yqqb	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-10 09:42:15.947567+00	2026-09-15 20:15:24.572503+00	bzy74svb7rpi	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	414	4ujos3j4lvlf	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 02:52:59.937977+00	2026-09-16 03:51:22.470186+00	xjjjvsxuvzy3	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	418	mreono23wfue	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-16 06:47:29.179511+00	2026-09-16 20:43:15.689754+00	3b7skvytqyi5	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	422	mdbwuiinyltr	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-16 20:43:15.698132+00	2026-09-16 20:43:15.698132+00	mreono23wfue	66c0c652-6542-44e6-a084-b787944503c5
00000000-0000-0000-0000-000000000000	426	mm5xopbwjxkj	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-17 07:03:58.238425+00	2026-09-17 16:32:04.400571+00	smzvlqvrfiff	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	430	iorxvcljfkak	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-17 22:10:20.27356+00	2026-09-17 23:18:13.390161+00	jpmjo7fiz6ui	5120afc8-02af-4ac5-8b21-9a7ddb777817
00000000-0000-0000-0000-000000000000	389	eahmuuv26aav	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-10 05:30:56.202117+00	2026-09-11 08:44:41.719327+00	2uyakfywhmwi	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	434	tt77smq37ykg	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 13:25:53.87919+00	2026-09-21 14:26:09.147062+00	\N	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	398	clzkn4dlp63t	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-15 13:52:59.702129+00	2026-09-15 14:51:29.334791+00	vgymspkm7bne	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	438	dyxnct7u6xs6	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 15:24:20.210862+00	2026-09-21 16:22:33.040118+00	6y6n2ece3buc	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	442	mgbmiq6ore2t	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-21 18:23:15.627862+00	2026-09-22 03:45:25.150989+00	\N	7015ba04-fea9-48a9-bb2d-4b34da7cc5b0
00000000-0000-0000-0000-000000000000	446	347tdqrh4xxv	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-22 18:33:08.030284+00	2026-09-22 20:31:59.643235+00	cc4jfoasmecu	f0fc3207-99de-4983-aeb4-3aec97cff1c8
00000000-0000-0000-0000-000000000000	454	v4c4fwreq4if	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-25 04:26:23.873467+00	2026-09-25 04:26:23.873467+00	ndh6cqp3ifif	45f2a109-d80b-448e-a730-ce866e1281fd
00000000-0000-0000-0000-000000000000	346	ij6dfyruarrd	aa61599b-fd8d-4c87-9e7a-14874579dcb7	t	2026-09-03 04:24:46.884078+00	2026-09-08 20:39:21.211381+00	kq7kezsrjx5c	668fd03e-d4f9-4cda-9f26-2102eb95850c
00000000-0000-0000-0000-000000000000	450	5ftfx6ddexfy	d25b6046-8cd6-48e5-b8f2-78373bc1818c	t	2026-09-23 22:40:59.228149+00	2026-09-28 05:49:22.069285+00	xr2jvxospie7	7015ba04-fea9-48a9-bb2d-4b34da7cc5b0
00000000-0000-0000-0000-000000000000	458	pcgjkkpyjvzg	d25b6046-8cd6-48e5-b8f2-78373bc1818c	f	2026-09-29 05:19:49.650433+00	2026-09-29 05:19:49.650433+00	oycq3kw3xp6p	f0fc3207-99de-4983-aeb4-3aec97cff1c8
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_tokens" ("id", "sso_provider_id", "token_hash", "prefix", "created_at", "expires_at", "revoked_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."scim_users" ("id", "sso_provider_id", "user_id", "resource", "created_at", "updated_at", "deleted_at") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: fialn_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_groups" ("id", "name", "weekday", "level", "description", "created_at") FROM stdin;
3615550e-d94e-4973-b8a2-35f6af200c79	Teoria das Cordas	1	Intermediário	Grupo de estudos de segunda-feira - nível intermediário	2026-08-03 11:08:11.68944+00
4bc4cc8f-9c82-4648-afa7-5857d1cd400f	Sobre Nós	3	Iniciante	Grupo de estudos de quarta-feira - nível iniciante	2026-08-03 11:08:11.68944+00
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."people" ("id", "full_name", "phone", "email", "notes", "is_student", "is_client", "created_at", "updated_at", "first_name", "last_name", "cpf") FROM stdin;
ff1ea0a1-5b31-4d1b-8c3f-2bd49f1587f0	cesio 70	11984799777	leo.zerino@gmail.com	\N	t	f	2026-09-10 10:23:27.388746+00	2026-09-10 10:23:27.388746+00	cesio	70	33631164890
5eef36c4-019f-466f-bff6-4b55ae37c844	Gustavo de Caires Marques	11961956603	gust.cmarques@gmail.com	Então, eu sempre tive curiosidade no mundo sexual, nessas de pesquisando e procurando sempre algo novo acabei encontrando o bdsm e depois o shibari em si, adorei a ideia de cordas amarrando e fazendo desenhos pelo corpo, pesquiso sempre q posso pra melhorar, me considero iniciante no shibari, conheço algumas regras e técnicas simples, mas quero aprender mais, tanto de um lado mais artístico quanto para algo mais erótico hahah, um sonho real meu e saber suspender alguém	t	f	2026-09-09 21:49:38.653205+00	2026-09-16 21:09:27.259185+00	Gustavo	de Caires Marques	48058594822
69a3ed3a-4573-4bfa-8fe2-85f348229474	Sebastian Curti	11951251712	\N	Faz o curso desde o ínicio	t	f	2026-08-03 20:42:18.539939+00	2026-08-03 20:42:18.539939+00	Sebastian	Curti	\N
567e0f1d-de5e-4ed5-af1d-33b858775ad9	Malena Stariolo	\N	\N	Foraisso achava que tinha nascido na argentina	t	f	2026-08-05 10:26:27.826856+00	2026-08-05 10:26:27.826856+00	Malena	Stariolo	\N
61f07f1f-0253-4bf8-bc0b-6674ec1c4e59	Giordana Bruna	\N	\N	brudana	t	f	2026-08-05 10:48:31.410054+00	2026-08-05 10:48:31.410054+00	Giordana	Bruna	\N
00fe157e-39aa-454f-af28-ca2785ef9714	Mariana Rodeso	\N	\N	Owner / Professora	f	f	2026-08-05 12:23:37.607037+00	2026-08-05 12:23:37.607037+00	Mariana	Rodeso	\N
e7c6f4d3-775f-4192-9107-ed16a43ff785	Dominic	\N	\N	\N	t	f	2026-08-05 12:48:12.699374+00	2026-08-05 12:48:12.699374+00	Dominic	\N	\N
3764122a-820e-482e-8f99-f9a92c725e30	Anna Letícia Valente	11995051888	\N	\N	t	f	2026-08-13 21:26:09.391209+00	2026-08-13 21:26:09.391209+00	Anna	Letícia Valente	\N
dfacaba3-5894-4f9c-86e3-24e27cf140e6	Samanta Martins Loureiro	21995007020	samantaloureiro96@gmail.com	Zero experiência, pedindo uma atenção extra por esse motivo, se mostrou meio insegura nesse quesito por ser um grupo aberto. Pagamento 25/08, 150,00	t	f	2026-08-27 01:41:20.061535+00	2026-09-16 21:09:30.193699+00	Samanta	Martins Loureiro	00738957259
646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	Roberta Godoy Fauth	11968706755	23.roberta@gmail.com	Robs	t	f	2026-08-05 10:47:02.861338+00	2026-09-16 21:11:53.502714+00	Roberta	Godoy Fauth	99723824000
852a84ca-7480-40ed-a829-1efd76983bf9	Marina Abramo	11995950568	mbramoc@gmail.com	\N	t	f	2026-08-05 10:45:22.428603+00	2026-09-16 21:20:41.705193+00	Marina	Abramo	44506801890
5ee27aa9-9716-4346-a3c3-58c02f10a3a9	Caio Jordão Calisto	11957894276	caio.jcalisto@gmail.com	\N	t	f	2026-09-09 21:56:47.075788+00	2026-09-16 21:21:03.971622+00	Caio Jordão	Calisto	36892737811
44b4db59-f10f-46f1-bef8-00281362f176	Tayse Ubriaco	12991977019	tayse.ubriaco@gmail.com	Apelido: Tay. Aluna intermediária	t	f	2026-08-05 10:11:20.001556+00	2026-09-16 21:40:18.491172+00	Tayse	Ubriaco	41905446802
df4bf59e-3e26-4f26-82bd-86f377121de0	Weslei Marinho Camargo	11944854506	wesleicamargo88@gmail.com	\N	t	f	2026-09-09 21:54:16.986468+00	2026-09-16 21:47:20.918829+00	Weslei	Marinho Camargo	36776636877
a5a0f701-d915-4018-975d-cf1c4080f6a0	Juliana Boscardin	11994941161	ju.boscardin@gmail.com	\N	t	f	2026-08-14 02:51:34.768354+00	2026-09-16 22:18:18.293645+00	Juliana	Boscardin	35288551855
c3689ce5-1f54-4230-bdf4-055a42e95469	Gabs Verçosa	35988561974	gabibnv2001@hotmail.com	\N	t	f	2026-08-05 12:48:26.641434+00	2026-09-16 23:43:10.200752+00	Gabs	Verçosa	\N
3020391d-6073-47d9-af17-38c1aa3a07c1	Amanda Rodrigues Alves	11984568449	mandinha51@hotmail.com	\N	t	f	2026-09-17 02:18:36.49399+00	2026-09-17 02:18:36.49399+00	Amanda	Rodrigues Alves	25992113878
f26b7b68-7731-4685-a0b8-4317f2ab9815	Liliane Nascimento de Sousa	119522224373	liliane.nsousa@gmail.com	fez 4 aulas particulares em 2025. Tem desempenho consideravelmente variável. Confiança se abala com facilidade. Necessita aproximação cuidadosa e acolhedora.	t	f	2026-08-05 10:25:22.673234+00	2026-09-17 10:47:23.550702+00	Liliane	Nascimento de Sousa	40837113881
1ef177b0-aec5-4144-b24d-24daec5472d5	Filipe Tavares Bernardes	11989282397	filipemohaa@hotmail.com	iniciante	t	f	2026-08-05 10:49:56.773826+00	2026-09-21 18:27:54.039369+00	Filipe	Tavares Bernardes	\N
\.


--
-- Data for Name: fialn_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_enrollments" ("id", "person_id", "group_id", "modality", "status", "start_date", "end_date", "notes", "created_at", "updated_at", "is_partner", "partner_details", "received_by", "payment_method") FROM stdin;
decf010a-15c0-4cb3-b984-34c9f6f467c8	3764122a-820e-482e-8f99-f9a92c725e30	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	completed	2026-08-04	2026-09-04	\N	2026-08-13 21:27:19.006195+00	2026-09-15 21:15:49.211+00	f	\N	shibarihouse	pix
e7069d15-cd04-4cdf-918f-d7d1d6205ce3	e7c6f4d3-775f-4192-9107-ed16a43ff785	3615550e-d94e-4973-b8a2-35f6af200c79	monthly_group	completed	2026-06-01	2026-07-01	Valor referente a duas aulas no mes de junho	2026-08-14 01:15:38.881209+00	2026-08-14 01:17:51.153+00	f	\N	shibarihouse	pix
06008da0-23e9-4dcb-964c-d067a98d4993	a5a0f701-d915-4018-975d-cf1c4080f6a0	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	completed	2026-08-12	2026-09-12	\N	2026-08-14 02:53:44.575889+00	2026-09-16 21:07:46.744+00	f	\N	shibarihouse	pix
b05a4ecc-1df5-4c97-a0e0-b799220159f6	44b4db59-f10f-46f1-bef8-00281362f176	3615550e-d94e-4973-b8a2-35f6af200c79	quarterly_group	completed	2025-12-01	2026-03-01	\N	2026-08-14 02:03:17.993852+00	2026-08-14 02:03:17.993852+00	f	\N	foraisso	pix
8c810531-1e5a-4a25-94d5-debd0ebfae77	44b4db59-f10f-46f1-bef8-00281362f176	3615550e-d94e-4973-b8a2-35f6af200c79	quarterly_group	completed	2026-03-01	2026-06-01	\N	2026-08-14 02:04:45.053497+00	2026-08-14 02:04:45.053497+00	f	\N	foraisso	pix
d23d0605-1ed1-47f0-b026-e756ce148388	c3689ce5-1f54-4230-bdf4-055a42e95469	3615550e-d94e-4973-b8a2-35f6af200c79	quarterly_group	completed	2026-06-15	2026-09-15	Começou no meio do mes (15/06); Parcelas 27/6 R$285; 01/7 R$250; 03/8 R$250; Falta R$40	2026-08-05 14:10:35.433425+00	2026-09-16 21:36:47.119+00	f	\N	shibarihouse	pix
da0a083a-4879-4486-bb6d-8f7cbe45a095	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	completed	2026-04-22	2026-07-22	Começou no meio do mes; Presentem 22/4 e 29/4	2026-08-11 09:27:40.780802+00	2026-08-14 02:33:35.678+00	f	\N	shibarihouse	pix
b233f846-f747-4c9f-882e-c832831b1189	f26b7b68-7731-4685-a0b8-4317f2ab9815	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	completed	2026-03-04	2026-06-04	Via aula particular com foraisso	2026-08-05 13:00:45.428186+00	2026-08-07 07:14:06.160048+00	f	\N	shibarihouse	pix
9e2bd694-a049-468a-8698-3050814dfe47	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	3615550e-d94e-4973-b8a2-35f6af200c79	single_group	completed	2026-04-13	2026-04-13	\N	2026-08-14 02:36:31.040135+00	2026-08-14 02:36:31.040135+00	f	\N	shibarihouse	pix
d87ef01c-8445-4e88-8a9d-b01d52bab1b8	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	active	2026-07-22	2026-10-22	\N	2026-08-14 02:38:38.636817+00	2026-08-14 02:38:38.636817+00	f	\N	shibarihouse	pix
fa4a6976-f1ac-4002-8f9a-8f649f9a5906	a5a0f701-d915-4018-975d-cf1c4080f6a0	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-08-05	2026-08-05	\N	2026-08-14 02:52:40.186319+00	2026-08-14 02:52:40.186319+00	f	\N	shibarihouse	pix
aaa55757-3029-428d-977c-d02d94ebe5f5	69a3ed3a-4573-4bfa-8fe2-85f348229474	3615550e-d94e-4973-b8a2-35f6af200c79	monthly_group	completed	2026-07-01	2026-08-01	pagou 3 aulas que foi em julho	2026-08-14 03:08:05.194454+00	2026-08-14 03:08:05.194454+00	f	\N	foraisso	pix
d24b6e47-537c-4547-9490-1741a63fd769	567e0f1d-de5e-4ed5-af1d-33b858775ad9	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	completed	2026-03-01	2026-06-01	\N	2026-08-11 09:34:43.771216+00	2026-08-11 09:34:43.771216+00	t	PARÇA	\N	\N
51b3f4b6-6d83-4942-ad7d-b924086bc64d	567e0f1d-de5e-4ed5-af1d-33b858775ad9	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	active	2026-06-01	2026-09-01	\N	2026-08-11 09:35:13.369699+00	2026-08-11 09:35:13.369699+00	t	PARÇA	\N	\N
eaa1a668-aac2-4b39-b4a9-fcc6db7959de	dfacaba3-5894-4f9c-86e3-24e27cf140e6	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-14	2026-10-14	\N	2026-09-21 15:14:33.013784+00	2026-09-21 15:14:33.013784+00	f	\N	foraisso	pix
ff559e00-2055-4bb9-a452-b6ec5b40502f	1ef177b0-aec5-4144-b24d-24daec5472d5	3615550e-d94e-4973-b8a2-35f6af200c79	single_group	completed	2026-07-06	2026-07-06	\N	2026-08-11 10:29:29.922159+00	2026-08-13 21:35:37.562+00	f	\N	shibarihouse	pix
8fc5de5f-62a6-4570-b779-22d2eed9b225	69a3ed3a-4573-4bfa-8fe2-85f348229474	3615550e-d94e-4973-b8a2-35f6af200c79	monthly_group	completed	2026-04-01	2026-05-01	pagou 2 aulas que foi em Abril	2026-08-14 03:09:29.58267+00	2026-08-14 03:09:29.58267+00	f	\N	foraisso	pix
1fb359a6-9bd5-4122-873b-e961d57d076b	69a3ed3a-4573-4bfa-8fe2-85f348229474	3615550e-d94e-4973-b8a2-35f6af200c79	monthly_group	completed	2026-03-01	2026-04-01	pagou 3 aulas que foi em Março	2026-08-14 03:10:36.685623+00	2026-08-14 03:10:36.685623+00	f	\N	foraisso	pix
382e318f-ad2d-4927-a51a-d176231a70f9	852a84ca-7480-40ed-a829-1efd76983bf9	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	completed	2026-06-17	2026-09-17	\N	2026-08-05 12:54:56.421265+00	2026-08-14 08:01:52.669+00	t	faz atas no TEORIA	\N	\N
a255c188-b8e4-43f7-95ac-f343cb2a35bd	44b4db59-f10f-46f1-bef8-00281362f176	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-07-22	2026-07-22	\N	2026-08-14 08:03:42.803256+00	2026-08-14 08:04:02.588+00	t	Veio na 4a no lugar da segunda	\N	\N
08c60a84-ab49-47a9-863d-22b96adadcbb	1ef177b0-aec5-4144-b24d-24daec5472d5	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	completed	2026-07-21	2026-08-21	\N	2026-08-13 21:41:40.551352+00	2026-08-26 21:44:19.396+00	f	\N	shibarihouse	pix
6dbaf9b4-a55c-4a2d-8767-e65b4eb5a048	3020391d-6073-47d9-af17-38c1aa3a07c1	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-09-16	2026-09-16	\N	2026-09-21 15:40:40.732893+00	2026-09-21 15:40:40.732893+00	f	\N	shibarihouse	pix
a0102cf5-5e59-47a0-b485-4176c67c9154	dfacaba3-5894-4f9c-86e3-24e27cf140e6	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-09-02	2026-09-02	avulsa 2	2026-09-03 03:50:03.453512+00	2026-09-03 04:26:31.93+00	f	\N	foraisso	pix
7d91e37a-5b75-4c32-8258-6c112071d5d3	c3689ce5-1f54-4230-bdf4-055a42e95469	3615550e-d94e-4973-b8a2-35f6af200c79	quarterly_group	active	2026-09-15	2026-12-15	acordo de parcelas (3x) com a Rodeso	2026-09-21 15:46:45.843785+00	2026-09-21 15:47:32.634+00	f	\N	shibarihouse	pix
99a8e797-72ff-4cee-b9bc-86b79924866e	1ef177b0-aec5-4144-b24d-24daec5472d5	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-02	2026-10-02	feito em pagamento único de 410 (mes + avulsa)	2026-09-03 03:39:49.566143+00	2026-09-03 04:28:10.857+00	f	\N	shibarihouse	pix
f2b09a7c-765a-4fb1-9c23-0b43c1640634	3020391d-6073-47d9-af17-38c1aa3a07c1	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-21	2026-10-21	\N	2026-09-21 15:59:22.990645+00	2026-09-21 15:59:22.990645+00	f	\N	foraisso	pix
24e38d6c-4e27-4ccb-be22-f4f463eb1ad9	1ef177b0-aec5-4144-b24d-24daec5472d5	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-08-26	2026-08-26	feita em parcela única em pagamento promocional	2026-09-03 03:41:14.077791+00	2026-09-03 04:30:58.364+00	f	\N	shibarihouse	pix
8a64408d-dc2c-4dee-93c3-95745982e428	dfacaba3-5894-4f9c-86e3-24e27cf140e6	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	single_group	completed	2026-08-26	2026-08-26	avulsa1	2026-08-27 01:42:04.723668+00	2026-09-03 04:26:38.277+00	f	\N	shibarihouse	pix
7243cbce-8de4-45e1-a64f-30bd2475d68b	f26b7b68-7731-4685-a0b8-4317f2ab9815	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	completed	2026-06-01	2026-09-01	\N	2026-08-11 10:54:06.895589+00	2026-09-09 21:31:33.557+00	f	\N	shibarihouse	pix
df99eb4c-06f8-472c-af29-959c4e65d70e	f26b7b68-7731-4685-a0b8-4317f2ab9815	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	quarterly_group	active	2026-09-01	2026-12-01	\N	2026-09-09 21:37:14.502994+00	2026-09-09 21:37:14.502994+00	f	\N	shibarihouse	pix
0adaeb78-41fa-4e18-bc62-6b50a0adaa26	a5a0f701-d915-4018-975d-cf1c4080f6a0	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-14	2026-10-14	\N	2026-09-09 21:45:59.634327+00	2026-09-09 21:45:59.634327+00	f	\N	foraisso	pix
27ac3cac-37b0-4be0-8622-77248d69f5b8	5eef36c4-019f-466f-bff6-4b55ae37c844	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-07	2026-10-07	\N	2026-09-09 21:50:49.554006+00	2026-09-09 21:50:49.554006+00	f	\N	shibarihouse	pix
0689023a-df0e-4a6a-9b66-da453529ddac	5ee27aa9-9716-4346-a3c3-58c02f10a3a9	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-07	2026-10-07	\N	2026-09-09 21:58:14.310535+00	2026-09-09 21:58:14.310535+00	f	\N	shibarihouse	pix
8129f1fc-19e4-499a-b3fa-a52c3122bd70	df4bf59e-3e26-4f26-82bd-86f377121de0	4bc4cc8f-9c82-4648-afa7-5857d1cd400f	monthly_group	active	2026-09-14	2026-10-14	\N	2026-09-09 21:55:20.128828+00	2026-09-10 02:27:21.951+00	f	\N	shibarihouse	pix
7eb58bb4-32bd-44af-b242-2a3c131300e7	44b4db59-f10f-46f1-bef8-00281362f176	3615550e-d94e-4973-b8a2-35f6af200c79	quarterly_group	completed	2026-06-01	2026-09-01	\N	2026-08-14 02:05:25.468239+00	2026-09-10 09:54:34.068+00	f	\N	foraisso	pix
ae77281c-c1af-4be1-9e36-aacf0f2851f9	852a84ca-7480-40ed-a829-1efd76983bf9	3615550e-d94e-4973-b8a2-35f6af200c79	single_group	completed	2026-09-14	2026-09-14	\N	2026-09-21 16:10:25.275205+00	2026-09-21 17:25:50.668+00	t	residente	\N	\N
\.


--
-- Data for Name: fialn_lesson_bundles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_lesson_bundles" ("id", "person_id", "name", "total_lessons", "used_lessons", "price", "status", "notes", "created_at", "updated_at") FROM stdin;
5ed6e494-5d71-4017-95e3-a31e57231a28	c3689ce5-1f54-4230-bdf4-055a42e95469	Pacote 4 Aulas Particulares	4	0	600.00	active	\N	2026-08-10 08:05:47.825953+00	2026-08-10 08:05:47.825953+00
\.


--
-- Data for Name: fialn_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_lessons" ("id", "person_id", "lesson_date", "duration_hours", "location", "topics_covered", "performance_notes", "action_items", "created_at", "bundle_id") FROM stdin;
\.


--
-- Data for Name: fiteo_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiteo_courses" ("id", "title", "schedule_day", "skill_level", "active", "created_at") FROM stdin;
d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	Teoria das Cordas	Monday	Intermediate	t	2026-08-03 11:32:00.940283+00
84565ee8-ab8a-4db4-9fdf-13b52a3290db	Sobre Nós	Wednesday	Beginner	t	2026-08-03 11:32:00.940283+00
\.


--
-- Data for Name: fialn_student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_student_profiles" ("id", "person_id", "strengths", "dificulties", "growth_pathway", "financial_status", "created_at", "shibari_experience", "shibari_goals", "course_preference_id", "group_preference_id", "weekday_preference", "terms_accepted_at", "terms_version", "terms_client_ip", "terms_ip_hash", "terms_user_agent", "confirmation_token", "confirmation_token_expires_at", "email_verified_at") FROM stdin;
1c750fc5-952c-43f1-a402-a840d423f7a5	61f07f1f-0253-4bf8-bc0b-6674ec1c4e59	\N	\N	\N	em_dia	2026-08-05 10:48:31.482836+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	56e90441-f68b-4b86-b330-546b536476e5	2026-09-13 09:35:24.362463+00	\N
6592918f-0129-4e62-9211-9a2aaeafed90	e7c6f4d3-775f-4192-9107-ed16a43ff785	\N	\N	\N	em_dia	2026-08-05 12:48:13.224934+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3e585f47-8521-4f98-8f6a-a728a1e8355a	2026-09-13 09:35:24.362463+00	\N
3a8cd87a-f772-4800-9272-906e125ce202	df4bf59e-3e26-4f26-82bd-86f377121de0	\N	\N	\N	em_dia	2026-09-09 21:54:17.099014+00	Não tenho nenhum experiência prévia.	Aprender tudo do zero.	\N	\N	\N	2026-09-16 21:47:20.918829+00	v1.0	191.181.59.103	de2daf7535cc2af81b4b0ec99f81cbb0744fa170ee09d4c7285e112582ca6b72	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	df8875de-9dd2-4f2d-a51f-dd37116d2328	2026-10-16 21:08:47.351965+00	2026-09-16 21:47:20.918829+00
83cfb4df-4883-4ff5-becf-9788e4961048	a5a0f701-d915-4018-975d-cf1c4080f6a0	\N	\N	\N	em_dia	2026-08-14 02:51:34.992035+00	pratico shibari desde 2018 com cursos 3 workshops, além de encontros livres como atados e a_corda	manter o conhecimento atualizado, com segurança e novas possibilidades de amarrações	\N	\N	\N	2026-09-16 22:18:18.293645+00	v1.0	189.62.45.156	1fe53d88c823a766c56fdf695f7b0859e029a181ed35536960048c738841dfcc	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36	f073dd61-6425-43ba-a9b1-14e26e09325b	2026-10-16 21:07:50.819217+00	2026-09-16 22:18:18.293645+00
da1e727e-a94b-4e58-8495-7a3deba2beb2	69a3ed3a-4573-4bfa-8fe2-85f348229474	\N	\N	\N	em_dia	2026-08-05 10:14:16.248681+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	59b036bd-53a4-4fab-97c5-43acecc57bfb	2026-10-16 05:30:13.333823+00	\N
1dd70b12-996d-4a8d-a268-096e27b281e7	567e0f1d-de5e-4ed5-af1d-33b858775ad9	\N	\N	\N	em_dia	2026-08-05 10:26:28.011699+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	e570c705-7052-460c-86dd-9b6542af6830	2026-09-13 09:35:24.362463+00	\N
6e6c2ba8-1265-484b-9aff-baaf853eff9f	c3689ce5-1f54-4230-bdf4-055a42e95469	\N	\N	\N	em_dia	2026-08-05 12:48:26.931559+00	Pratico a cerca de dois anos. Finalizei curso introdutório on-line da Akira Nawa em 2024, curso de formação na Shibari House semanal ao longo de 2025, curso em andamento semanal de aperfeiçoamento com Foraisso na Shibari House, e oficinas variadas avulsas ao longo desses anos.	Melhorar em condução. Desenvolver uso de bambus e hashiras. Revisar estruturas básicas (bunytie, tengu e strapado) e suas variações para que sejam suspendiveis.	\N	\N	\N	2026-09-16 23:43:10.200752+00	v1.0	172.225.223.49	e00414bcb3f97fc02e2395575406847468274dbc9fedb093f953de654f79f360	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	e49efd4d-960c-40b3-bcae-5c045ad2bca7	2026-10-16 21:36:48.813152+00	2026-09-16 23:43:10.200752+00
e570c840-e272-4d68-bffd-7988172865e6	f26b7b68-7731-4685-a0b8-4317f2ab9815	\N	\N	\N	em_dia	2026-08-05 10:25:22.903192+00	\N	\N	\N	\N	\N	2026-09-17 10:47:23.550702+00	v1.0	189.29.146.13	095517d0f0d1b28af4926503716ab02db0a55952fee64b510414117c3ec89f21	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36	d289c763-64a3-49ff-bf08-0af942d2c780	2026-10-16 21:09:54.763571+00	2026-09-17 10:47:23.550702+00
94d6382f-faf6-4a7d-aae1-e2bd15498d2d	3020391d-6073-47d9-af17-38c1aa3a07c1	\N	\N	\N	em_dia	2026-09-17 02:18:36.49399+00	Começando do zero	Aprender amarrar minimamente. Tenho interesse em ser amarrada também	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	3	2026-09-17 02:18:36.49399+00	v1.0	187.116.72.203	4f23ed1c65844f602f624ef78936143aff6b20e0ae3535e55b30467b4bf165f2	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	5bcdd2a1-48c3-46f2-a6e3-adb1b5ab7b5c	2026-10-21 14:27:41.651321+00	2026-09-17 02:19:52.538466+00
7fd9cbc7-4a50-473b-a597-1990dde0ed0b	852a84ca-7480-40ed-a829-1efd76983bf9	\N	\N	\N	em_dia	2026-08-05 10:45:22.51606+00	pratico há um ano como bottom. Comecei a amarrar há quatro meses	aprender as figuras clássicas	\N	\N	\N	2026-09-16 21:20:41.705193+00	v1.0	172.225.232.130	7c89e1fc6b80c9f615c93fd2e2c0100d434711216f69e017fccd11e7d136c236	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	671bdc30-df89-48dc-89ed-2ec08eab1169	2026-10-21 14:40:04.394326+00	2026-09-16 21:20:41.705193+00
c723ab2e-a07e-47cc-a25e-685f03beccf3	ff1ea0a1-5b31-4d1b-8c3f-2bd49f1587f0	\N	\N	\N	em_dia	2026-09-10 10:23:27.388746+00	\N	ralalalalalala	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	3	2026-09-10 10:23:27.388746+00	v1.0	179.209.47.26	9f025accc4dffa3fcb13200b95de978e1ffb7adbd053daccad59a783fd725f2f	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0	2f4e8bcc-178c-49e8-a611-8a42259eeb6e	2026-09-13 10:23:27.388746+00	2026-09-10 10:30:18.349883+00
1ca94cf8-9411-4c91-ae1d-335a0c649e74	5eef36c4-019f-466f-bff6-4b55ae37c844	\N	\N	\N	em_dia	2026-09-09 21:49:38.805818+00	Já pratico a alguns anos, porém muito iniciante que tudo que aprendi foi por conta própria	Quero “me especializar “ virar um rigger de vdd, saber amarrar e suspender alguém tbm	\N	\N	\N	2026-09-16 21:09:27.259185+00	v1.0	191.39.155.180	2fadd68f746695e436f2ae80a29c936d380eaeb1b52bd606ee16e8c9c3b8fc76	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	843e972f-45fb-4a4d-922f-d33ae8d457a3	2026-10-16 21:05:21.086178+00	2026-09-16 21:09:27.259185+00
e2eacfc6-1c47-4372-89d2-322bcc1c1cd7	1ef177b0-aec5-4144-b24d-24daec5472d5	\N	precisa entender tensão, perder o medo.\nmais atenção atenção à detalhas	\N	em_dia	2026-08-05 10:49:56.878593+00	Pratico há 2 anos, fiz 2 suspensões supervisionadas. E venho desenvolvendo mais fundamentos esse ano.	Aprender condução, melhoras os fundamentos no solo e suspensão	\N	\N	\N	2026-09-21 18:27:54.039369+00	v1.0	104.28.47.100	d283089b36089ead0a7a25003e5c50eacc6986fcc339436669c20897e2c4da4b	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	1814909d-3b3d-4043-ac6e-a64a78a668f4	2026-10-16 21:04:58.111724+00	2026-09-21 18:27:54.039369+00
26f975b4-dab2-4cbf-8e9b-ebacd4de7a53	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	\N	\N	\N	em_dia	2026-08-05 10:47:02.985629+00	já pratico há 2 anos e meio, fazendo aulas regulares e workshops sempre que consigo, participando de eventos, inclusive.	Aprender tudo, sem exceção. Em algum momento eu vou optar por aprofundar alguns padrões e técnicas, mas por enqaunto eu quero aprender tudo.	\N	\N	\N	2026-09-16 21:11:53.502714+00	v1.0	177.92.76.118	e3b95192a92394dba36ac795a3c77e182c3de5c77335e52fffff039a24eed6ba	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	13910b5f-907b-4408-b6ba-f4033ee0f767	2026-10-16 21:08:13.2433+00	2026-09-16 21:11:53.502714+00
519673b6-9577-4f4b-90cf-633574dc3fb1	3764122a-820e-482e-8f99-f9a92c725e30	\N	\N	\N	em_dia	2026-08-13 21:26:09.522601+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	50fb70ac-c004-46d6-9801-38d54ccf3b98	2026-10-16 21:18:32.400797+00	\N
32f8f9ba-971d-41f8-ac02-f91b180377eb	dfacaba3-5894-4f9c-86e3-24e27cf140e6	mostrou em foto belos rigs no scarpin / cinta liga com tensões muito adequadas.\npuxar isso para aula	precisa estudar estruturas básicas\ne entender tensão (o que contrasta com os rigs que fez em si própria)\n\nmuito afobada para fazer estruturas complexas	trazer criatividade do aluno para aula ao inves de forçar estruturas clássicas como paradigma	em_dia	2026-08-27 01:41:20.2143+00	Ainda não havia feito cursos antes, mas já tinha feito algumas coisas aprendendo pela internet.	Quero chegar na suspensão, mas quero aprender um pouco de tudo mesmo	\N	\N	\N	2026-09-16 21:09:30.193699+00	v1.0	179.209.44.144	3cf9649950d1d159b1a06394a0f88160aeac6772caeb18d4be8382f1c78ca232	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	eb0636ec-d58f-47f1-9356-2b3f7eecdaa8	2026-10-16 21:02:44.216297+00	2026-09-16 21:09:30.193699+00
14e7282a-b6fa-4d53-b087-bd1a2896a79c	5ee27aa9-9716-4346-a3c3-58c02f10a3a9	\N	\N	\N	em_dia	2026-09-09 21:56:47.192664+00	Nenhuma	Suspensões e nós	\N	\N	\N	2026-09-16 21:21:03.971622+00	v1.0	177.147.41.151	1ebc859ada4e0f14c8078375e3fce29d9c98132235818db8dddc0545e878eb93	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	6826e1cd-e0bc-4bdb-81f3-290c096fd215	2026-10-16 21:04:30.671002+00	2026-09-16 21:21:03.971622+00
af34ef0b-0d72-4758-b553-e26f206688ad	44b4db59-f10f-46f1-bef8-00281362f176	\N	\N	\N	em_dia	2026-08-05 10:11:20.149131+00	Pratico há 3 anos, mais regularmente há 12 meses. Realizei cursos com Shibari Brasil e Sansa Rope anteriormente.	Ter uma rotina consistente de prática e aprimorar técnicas	\N	\N	\N	2026-09-16 21:40:18.491172+00	v1.0	179.99.126.81	3de736fab565190bc72ed2a39581aedcc9015c35f685ff533364d2c6f7420531	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	76285f3f-c130-4bc3-b1c3-491c367cdbfc	2026-10-16 21:36:20.488348+00	2026-09-16 21:40:18.491172+00
\.


--
-- Data for Name: fialn_student_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fialn_student_transactions" ("id", "person_id", "enrollment_id", "bundle_id", "transaction_date", "description", "received_by", "amount", "payment_method", "due_date", "split_percent", "split_amount", "split_type", "fiorc_projection_due_date", "fiorc_status", "installment_index", "total_installments", "notes", "created_by", "created_at", "updated_at", "settled_at", "settlement_batch_id", "codigo") FROM stdin;
206fbecc-459e-4be2-93cd-6ea859f33017	44b4db59-f10f-46f1-bef8-00281362f176	b05a4ecc-1df5-4c97-a0e0-b799220159f6	\N	2026-02-23	Plano Trimestral (Teoria das Cordas)	foraisso	900.00	pix	\N	25.00	225.00	debt	2026-03-05	settled	1	1	\N	\N	2026-08-14 02:03:18.236423+00	2026-08-14 03:14:57.926668+00	2026-08-14 03:14:57.926668+00	1b6b9af0-7961-40bc-9677-9551d3a5c630	TEOTR
7f893c30-ccdb-4f21-8039-1196ade0a1ac	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	d87ef01c-8445-4e88-8a9d-b01d52bab1b8	\N	2026-08-10	Plano Trimestral (Sobre Nós)	shibarihouse	750.00	pix	\N	75.00	562.50	receivable	2026-09-05	settled	1	1	\N	\N	2026-08-14 02:38:38.779294+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBTR
92d60889-b529-4371-9898-145d5669e56f	a5a0f701-d915-4018-975d-cf1c4080f6a0	fa4a6976-f1ac-4002-8f9a-8f649f9a5906	\N	2026-08-05	Aula Avulsa Grupo (Sobre Nós)	shibarihouse	100.00	pix	\N	75.00	75.00	receivable	2026-09-05	settled	1	1	\N	\N	2026-08-14 02:52:40.297734+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBAV
a2132377-e10a-49ed-9aa7-fa591ef09cc6	a5a0f701-d915-4018-975d-cf1c4080f6a0	06008da0-23e9-4dcb-964c-d067a98d4993	\N	2026-08-06	Plano Mensal (Sobre Nós)	shibarihouse	300.00	pix	\N	75.00	225.00	receivable	2026-09-05	settled	1	1	\N	\N	2026-08-14 02:53:44.813122+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBME
dde49236-912a-4366-9586-4201329b7ec0	69a3ed3a-4573-4bfa-8fe2-85f348229474	aaa55757-3029-428d-977c-d02d94ebe5f5	\N	2026-07-31	Plano Mensal (Teoria das Cordas)	foraisso	225.00	pix	\N	25.00	56.25	debt	2026-08-05	settled	1	1	\N	\N	2026-08-14 03:08:05.398967+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	TEOME
b3ac8e1f-c40f-43c6-9ecd-d87fc51b7f6d	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	da0a083a-4879-4486-bb6d-8f7cbe45a095	\N	2026-04-15	Plano Trimestral (Sobre Nós)	shibarihouse	750.00	pix	\N	75.00	562.50	receivable	2026-05-05	settled	1	1	\N	\N	2026-08-14 02:33:36.37865+00	2026-08-14 03:14:57.926668+00	2026-08-14 03:14:57.926668+00	1b6b9af0-7961-40bc-9677-9551d3a5c630	SOBTR
c7fdc53a-a506-4fd8-b055-203655c32807	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	9e2bd694-a049-468a-8698-3050814dfe47	\N	2026-04-15	Aula Avulsa Grupo (Teoria das Cordas)	shibarihouse	100.00	pix	\N	75.00	75.00	receivable	2026-05-05	settled	1	1	\N	\N	2026-08-14 02:36:31.197474+00	2026-08-14 03:14:57.926668+00	2026-08-14 03:14:57.926668+00	1b6b9af0-7961-40bc-9677-9551d3a5c630	TEOAV
cd981e64-178c-44bf-9baf-274239faa4d6	69a3ed3a-4573-4bfa-8fe2-85f348229474	1fb359a6-9bd5-4122-873b-e961d57d076b	\N	2026-04-06	Plano Mensal (Teoria das Cordas)	foraisso	225.00	pix	\N	25.00	56.25	debt	2026-05-05	settled	1	1	\N	\N	2026-08-14 03:10:36.855197+00	2026-08-14 03:14:57.926668+00	2026-08-14 03:14:57.926668+00	1b6b9af0-7961-40bc-9677-9551d3a5c630	TEOME
b519e129-c9c7-436a-a3fb-6b87e060c895	1ef177b0-aec5-4144-b24d-24daec5472d5	08c60a84-ab49-47a9-863d-22b96adadcbb	\N	2026-07-21	Plano Mensal (Sobre Nós)	shibarihouse	350.00	pix	\N	75.00	262.50	receivable	2026-08-05	settled	1	1	\N	\N	2026-08-13 21:41:40.74755+00	2026-08-13 23:52:08.660983+00	2026-08-05 17:44:08.660983+00	47c8071b-d330-4945-abf4-361476d5d860	SOBME
4bfd8299-22a1-4b9b-a557-1125eb86fd83	1ef177b0-aec5-4144-b24d-24daec5472d5	ff559e00-2055-4bb9-a452-b6ec5b40502f	\N	2026-07-06	Aula Avulsa Grupo (Teoria das Cordas)	shibarihouse	150.00	pix	\N	75.00	112.50	receivable	2026-09-05	settled	1	1	\N	\N	2026-08-11 10:29:30.162143+00	2026-08-13 23:52:08.660983+00	2026-08-05 17:44:08.660983+00	47c8071b-d330-4945-abf4-361476d5d860	TEOAV
8926c8ab-068e-4cca-94d1-37d108c4dabb	3764122a-820e-482e-8f99-f9a92c725e30	decf010a-15c0-4cb3-b984-34c9f6f467c8	\N	2026-08-04	Plano Mensal (Sobre Nós)	shibarihouse	350.00	pix	\N	75.00	262.50	receivable	2026-09-05	settled	1	1	\N	\N	2026-08-13 21:27:19.188388+00	2026-08-13 23:52:08.660983+00	2026-08-05 17:44:08.660983+00	47c8071b-d330-4945-abf4-361476d5d860	SOBME
d5e493cb-5a5a-420a-87a5-12c662ca6adc	44b4db59-f10f-46f1-bef8-00281362f176	8c810531-1e5a-4a25-94d5-debd0ebfae77	\N	2026-06-29	Plano Trimestral (Teoria das Cordas)	foraisso	900.00	pix	\N	25.00	225.00	debt	2026-07-05	settled	1	1	\N	\N	2026-08-14 02:04:45.236213+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	TEOTR
f6ab958c-2223-4e4e-b84f-90bb3f66232c	44b4db59-f10f-46f1-bef8-00281362f176	7eb58bb4-32bd-44af-b242-2a3c131300e7	\N	2026-06-29	Plano Trimestral (Teoria das Cordas)	foraisso	900.00	pix	\N	25.00	225.00	debt	2026-07-05	settled	1	1	\N	\N	2026-08-14 02:05:25.570093+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	TEOTR
a0801251-346d-4436-b7d6-8c2bea262f06	69a3ed3a-4573-4bfa-8fe2-85f348229474	8fc5de5f-62a6-4570-b779-22d2eed9b225	\N	2026-05-05	Plano Mensal (Teoria das Cordas)	foraisso	150.00	pix	\N	25.00	37.50	debt	2026-06-05	settled	1	1	\N	\N	2026-08-14 03:09:29.735079+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	TEOME
8362ab93-9529-49c5-86e1-be133108669d	f26b7b68-7731-4685-a0b8-4317f2ab9815	7243cbce-8de4-45e1-a64f-30bd2475d68b	\N	2026-05-30	Plano Trimestral (Sobre Nós)	shibarihouse	750.00	pix	\N	75.00	562.50	receivable	2026-06-05	settled	1	1	\N	\N	2026-08-14 00:39:50.178641+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	SOBTR
e4a355b4-c296-415f-8c52-ed4a5849aef5	e7c6f4d3-775f-4192-9107-ed16a43ff785	e7069d15-cd04-4cdf-918f-d7d1d6205ce3	\N	2026-06-01	Plano Mensal (Teoria das Cordas)	shibarihouse	200.00	pix	\N	75.00	150.00	receivable	2026-07-05	settled	1	1	\N	\N	2026-08-14 01:17:51.538429+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	TEOME
baff5a41-f070-4d55-b585-faeb0ade2c69	c3689ce5-1f54-4230-bdf4-055a42e95469	d23d0605-1ed1-47f0-b026-e756ce148388	\N	2026-06-27	Plano Trimestral (Teoria das Cordas)	shibarihouse	825.00	pix	\N	75.00	618.75	receivable	2026-07-05	settled	1	1	\N	\N	2026-08-14 01:54:57.071239+00	2026-08-14 03:15:21.238589+00	2026-08-14 03:15:21.238589+00	2782ea55-2058-4074-8c4a-294e8e65b84d	TEOTR
9deaa97c-b1aa-4677-87f5-a74d91212945	dfacaba3-5894-4f9c-86e3-24e27cf140e6	a0102cf5-5e59-47a0-b485-4176c67c9154	\N	2026-09-02	Aula Avulsa Grupo (Sobre Nós)	foraisso	150.00	pix	\N	25.00	37.50	debt	2026-10-05	settled	1	1	\N	\N	2026-09-03 04:26:32.149946+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBAV
10b485f9-44cc-4fa7-b633-e5918de591de	dfacaba3-5894-4f9c-86e3-24e27cf140e6	8a64408d-dc2c-4dee-93c3-95745982e428	\N	2026-08-25	Aula Avulsa Grupo (Sobre Nós)	shibarihouse	150.00	pix	\N	75.00	112.50	receivable	2026-09-05	settled	1	1	\N	\N	2026-09-03 04:26:38.454292+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBAV
25aa440e-ca23-4c4f-af23-f331db21b711	1ef177b0-aec5-4144-b24d-24daec5472d5	99a8e797-72ff-4cee-b9bc-86b79924866e	\N	2026-09-02	Plano Mensal (Sobre Nós)	shibarihouse	300.00	pix	\N	75.00	225.00	receivable	2026-10-05	settled	1	1	\N	\N	2026-09-03 04:28:11.160542+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBME
37b4a00f-42ce-4b49-9a54-407c33eff831	1ef177b0-aec5-4144-b24d-24daec5472d5	24e38d6c-4e27-4ccb-be22-f4f463eb1ad9	\N	2026-09-02	Aula Avulsa Grupo (Sobre Nós)	shibarihouse	110.00	pix	\N	75.00	82.50	receivable	2026-10-05	settled	1	1	\N	\N	2026-09-03 04:30:58.662294+00	2026-09-09 21:31:08.913809+00	2026-09-09 21:31:08.913809+00	6e8d5df4-d23b-4743-9d2d-0283a1c5386d	SOBAV
621e33fd-8888-4904-973b-b28bb91a9731	f26b7b68-7731-4685-a0b8-4317f2ab9815	df99eb4c-06f8-472c-af29-959c4e65d70e	\N	2026-09-08	Plano Trimestral (Sobre Nós)	shibarihouse	750.00	pix	\N	75.00	562.50	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-09 21:37:14.749765+00	2026-09-09 21:37:14.749765+00	\N	\N	SOBTR
55eb86bb-fe9e-4d2a-94ab-258eb91af55d	a5a0f701-d915-4018-975d-cf1c4080f6a0	0adaeb78-41fa-4e18-bc62-6b50a0adaa26	\N	2026-09-09	Plano Mensal (Sobre Nós)	foraisso	300.00	pix	\N	25.00	75.00	debt	2026-10-05	pending	1	1	\N	\N	2026-09-09 21:45:59.774488+00	2026-09-09 21:45:59.774488+00	\N	\N	SOBME
482964c3-8518-4503-86fe-5070bd0fa0eb	5eef36c4-019f-466f-bff6-4b55ae37c844	27ac3cac-37b0-4be0-8622-77248d69f5b8	\N	2026-09-02	Plano Mensal (Sobre Nós)	shibarihouse	300.00	pix	\N	75.00	225.00	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-09 21:50:49.683642+00	2026-09-09 21:50:49.683642+00	\N	\N	SOBME
0261d90c-f8b0-430c-a9c1-2d1132f16a0e	5ee27aa9-9716-4346-a3c3-58c02f10a3a9	0689023a-df0e-4a6a-9b66-da453529ddac	\N	2026-09-09	Plano Mensal (Sobre Nós)	shibarihouse	300.00	pix	\N	75.00	225.00	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-09 21:58:14.404898+00	2026-09-09 21:58:14.404898+00	\N	\N	SOBME
9b526dfd-472c-4777-844f-4a5f2e128090	df4bf59e-3e26-4f26-82bd-86f377121de0	8129f1fc-19e4-499a-b3fa-a52c3122bd70	\N	2026-09-08	Plano Mensal (Sobre Nós)	shibarihouse	300.00	pix	\N	75.00	225.00	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-10 02:27:22.440274+00	2026-09-10 02:27:22.440274+00	\N	\N	SOBME
55d700c0-081c-44b6-854e-52d1f87b3f18	dfacaba3-5894-4f9c-86e3-24e27cf140e6	eaa1a668-aac2-4b39-b4a9-fcc6db7959de	\N	2026-09-16	Plano Mensal (Sobre Nós)	foraisso	300.00	pix	\N	25.00	75.00	debt	2026-10-05	pending	1	1	\N	\N	2026-09-21 15:14:33.237493+00	2026-09-21 15:14:33.237493+00	\N	\N	SOBME
de1542d8-247b-40e8-8619-2a9a1cae4da9	3020391d-6073-47d9-af17-38c1aa3a07c1	6dbaf9b4-a55c-4a2d-8767-e65b4eb5a048	\N	2026-09-15	Aula Avulsa Grupo (Sobre Nós)	shibarihouse	150.00	pix	\N	75.00	112.50	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-21 15:40:40.861568+00	2026-09-21 15:40:40.861568+00	\N	\N	SOBAV
31d138bd-fca2-4f99-9e62-34ca5c4bfcc8	c3689ce5-1f54-4230-bdf4-055a42e95469	7d91e37a-5b75-4c32-8258-6c112071d5d3	\N	2026-09-09	Plano Trimestral (Teoria das Cordas)	shibarihouse	900.00	pix	\N	75.00	675.00	receivable	2026-10-05	pending	1	1	\N	\N	2026-09-21 15:47:33.036556+00	2026-09-21 15:47:33.036556+00	\N	\N	TEOTR
13025114-fad8-4562-9285-353fdf96236c	3020391d-6073-47d9-af17-38c1aa3a07c1	f2b09a7c-765a-4fb1-9c23-0b43c1640634	\N	2026-09-21	Plano Mensal (Sobre Nós)	foraisso	300.00	pix	\N	25.00	75.00	debt	2026-10-05	pending	1	1	\N	\N	2026-09-21 15:59:23.056175+00	2026-09-21 15:59:23.056175+00	\N	\N	SOBME
\.


--
-- Data for Name: fiatt_client_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiatt_client_records" ("id", "person_id", "medical_history", "physiological_notes", "pathologies", "emergency_contact", "created_at") FROM stdin;
\.


--
-- Data for Name: fiorc_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_transactions" ("id", "person_id", "type", "category", "amount", "due_date", "paid_at", "is_projection", "is_credit_card", "installment_index", "total_installments", "description", "created_at", "parent_id", "transaction_datetime", "tags", "received_by", "enrollment_id") FROM stdin;
5dcc8b07-0d9e-4bed-a207-671e390bb60b	\N	expense	food_grocery	5.95	2026-08-08	\N	f	t	1	1	Clube Ifood	2026-08-03 09:52:48.053166+00	\N	2026-07-20 09:49:00+00	\N	\N	\N
f1d03628-0228-4517-afa3-0f4df10ee32d	\N	expense	leisure	44.00	2026-08-08	\N	f	t	1	1	Boteco Ana ensaio	2026-08-03 09:55:14.734608+00	\N	2026-07-20 02:44:00+00	{ana}	\N	\N
15cd70af-0bbd-4bec-ae3c-4217f94141eb	\N	expense	food_grocery	25.02	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:56:30.50914+00	\N	2026-07-18 23:04:00+00	\N	\N	\N
1cfb9140-807c-4e85-8ec6-5c24d0f7a25d	\N	expense	food_delivery	30.00	2026-08-08	\N	f	t	1	1	Pompeu	2026-08-03 09:57:03.9069+00	\N	2026-07-18 22:49:00+00	\N	\N	\N
aa72ab6e-ad12-4707-bff3-08917224355d	\N	expense	food_delivery	24.20	2026-08-08	\N	f	t	1	1	kafta niver lauraa	2026-07-25 03:12:46.136455+00	\N	2026-07-25 03:01:00+00	{}	\N	\N
6d95fe63-ea27-4e98-a6fd-e8426b08cbf8	\N	expense	food_grocery	16.39	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:57:30.737417+00	\N	2026-07-18 18:12:00+00	\N	\N	\N
5c470676-7d11-44a6-802f-761c5ae74d21	\N	expense	transport_app	11.64	2026-08-08	\N	f	t	1	1	uber niver laura	2026-07-31 08:17:16.743201+00	\N	2026-07-25 04:12:00+00	{uber}	\N	\N
74b2f45d-0f0e-46ea-a8db-b7d0c701c60a	\N	expense	leisure	10.00	2026-08-08	\N	f	f	1	1	breja niver laura	2026-07-25 04:00:39.527369+00	\N	2026-07-25 04:00:00+00	{}	\N	\N
7c062124-5fe2-4486-8d97-65697d2f8cc8	\N	expense	leisure	11.25	2026-08-08	\N	f	t	1	1	cigarro pompeu	2026-07-31 08:18:24.432499+00	\N	2026-07-25 05:15:00+00	{cigarro,role}	\N	\N
5dee09ad-30c9-46f2-b528-dd2611b158d2	\N	expense	pet	49.62	2026-08-08	\N	f	t	1	1	Areia gatos	2026-08-03 09:57:56.162314+00	\N	2026-07-18 03:32:00+00	\N	\N	\N
c4be9e6d-2e71-4349-9a8f-eddc80f3ab1a	\N	expense	food_grocery	23.48	2026-08-08	\N	f	t	1	1	sonda monsters pao	2026-07-25 03:14:26.119884+00	\N	2026-07-24 23:36:00+00	{}	\N	\N
f2baa135-355a-418e-8a67-2bace9678d90	\N	expense	transport_public	21.20	2026-08-08	\N	f	t	1	1	Bilhete unico	2026-08-01 02:22:04.708186+00	\N	2026-07-26 00:13:00+00	\N	\N	\N
1cf942ac-399d-4c8c-92fb-4312b536590b	\N	expense	food_delivery	28.91	2026-08-01	2026-08-01	f	f	1	1	marmita keeta	2026-08-01 08:11:54.253339+00	\N	2026-08-01 08:11:54.048+00	{keeta}	\N	\N
b0f30489-5712-4e98-846f-8b8743b98a28	\N	expense	transport_public	21.20	2026-08-08	\N	f	t	1	1	Bilhete ùnico	2026-08-03 09:58:31.39168+00	\N	2026-07-18 02:40:00+00	\N	\N	\N
3a85c48a-0dba-4fc2-a2b0-3a0a6233bcd0	\N	expense	food_delivery	32.88	2026-08-08	\N	f	t	1	1	copanzinho lanche	2026-08-01 02:58:45.222512+00	\N	2026-07-26 23:40:00+00	{misterio}	\N	\N
95807c80-302f-44a1-a98f-bcdded9c57cd	\N	expense	transport_public	21.20	2026-08-08	\N	f	t	1	1	Bilhete Único	2026-08-01 08:23:48.808549+00	\N	2026-07-30 22:15:00+00	\N	\N	\N
95663e56-e5b3-42ce-9264-b38f0d603cbe	\N	expense	food_grocery	13.99	2026-09-08	2026-08-02	f	t	1	1	chocolate Lucas 	2026-08-03 00:26:28.848399+00	\N	2026-08-03 00:26:00+00	\N	\N	\N
3b4a1486-de86-44c6-bed0-bc8cd43f5b10	\N	expense	food_grocery	47.09	2026-08-08	\N	f	t	1	1	Sonda avocado rucula lasanha	2026-08-01 08:22:31.998329+00	\N	2026-07-28 23:26:00+00	{DESCREVER}	\N	\N
4d861b4c-a834-4cae-8f0d-fada04c3ffea	\N	expense	food_grocery	33.55	2026-08-08	\N	f	t	1	1	Sonda vinagre 2x lasanha	2026-08-01 08:23:10.3384+00	\N	2026-07-29 21:22:00+00	{DESCREVER}	\N	\N
94a1d675-85a6-419a-9c5a-27106734af67	\N	expense	food_grocery	43.23	2026-08-08	\N	f	t	1	1	sonda morgana maracuja abacaxi	2026-07-31 08:19:55.085974+00	\N	2026-07-26 00:05:00+00	{"boa ação"}	\N	\N
a2f91df3-c1c2-47bf-8f40-64e500354ef5	\N	expense	food_grocery	24.48	2026-08-08	\N	f	t	1	1	Sonda 2x monster	2026-08-03 09:46:23.870293+00	\N	2026-07-24 11:36:00+00	{ana}	\N	\N
2839f7f6-bf8f-4b09-ad48-ebd62b9414f6	\N	expense	food_grocery	15.00	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:47:07.401244+00	\N	2026-07-22 22:16:00+00	\N	\N	\N
e4e5e6c2-13f0-4c37-aed9-ce513522713e	\N	expense	food_grocery	6.40	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:47:32.116302+00	\N	2026-07-22 21:45:00+00	\N	\N	\N
a8331dad-bee9-4bef-addc-a334cb58e274	\N	expense	business	257.00	2026-08-08	\N	f	t	1	1	PAssagem Shibari Experience	2026-08-03 09:59:03.14319+00	\N	2026-07-17 05:34:00+00	{excepcional}	\N	\N
ac453e6d-971b-4800-a17d-77ea8a0a873c	\N	expense	food_delivery	10.00	2026-08-08	\N	f	t	1	1	Café Sesc	2026-08-03 09:48:50.915269+00	\N	2026-07-22 18:08:00+00	\N	\N	\N
ddfd27c9-9f25-4eee-a97e-1db2085f570c	\N	expense	leisure	38.50	2026-08-08	\N	f	t	1	1	Niver Sebs Pernil	2026-08-03 09:49:35.846223+00	\N	2026-07-22 03:09:00+00	{role}	\N	\N
d71d6ec0-f7c1-43fb-9560-0b1cb48b4f10	\N	expense	food_grocery	21.17	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:50:30.767492+00	\N	2026-07-20 21:22:00+00	\N	\N	\N
d63c54d3-7d02-40a1-a837-09f70c85a4f0	\N	expense	food_grocery	9.99	2026-08-08	\N	f	t	1	1	Sonda	2026-08-03 09:50:51.834946+00	\N	2026-07-20 20:13:00+00	\N	\N	\N
072ef314-1dba-4d52-93aa-2b3da34b8c81	\N	expense	food_delivery	37.00	2026-08-08	\N	f	t	1	1	Estadão	2026-08-03 09:50:09.739245+00	\N	2026-07-21 02:45:00+00	\N	\N	\N
aad1aaa0-725e-4ec0-a1cc-9ab01ba8ce11	\N	expense	health	47.32	2026-04-08	\N	f	t	1	1	Carbolitium 300mg 60cp	2026-08-03 10:18:41.068358+00	\N	2026-03-15 23:40:00+00	{psiquiatria}	\N	\N
1baef254-92d1-4252-82d9-558a257479f4	\N	expense	food_grocery	19.21	2026-08-01	\N	f	f	1	1	Sonda Guaca Coentro Tomate	2026-08-03 10:24:09.06676+00	\N	2026-08-01 16:46:00+00	{cozinha}	\N	\N
a612c98a-592c-4dd2-9c70-84c31245c1c1	\N	expense	leisure	10.99	2026-08-01	\N	f	f	1	1	Presente Ester Lirio	2026-08-03 10:24:48.989773+00	\N	2026-08-01 16:46:00+00	{presente}	\N	\N
f1c5cf13-fad3-4d16-b483-1ddd5a63c30c	\N	expense	food_delivery	27.00	2026-09-08	\N	f	t	1	1	PF pós teoria	2026-08-04 05:54:06.640814+00	\N	2026-08-04 05:54:06.21+00	\N	\N	\N
28083adc-cab4-4ff8-a8b4-6723799018bc	\N	expense	leisure	34.79	2026-09-08	\N	f	t	1	1	vinho + twix	2026-08-04 05:55:57.267272+00	\N	2026-08-04 05:54:00+00	{entorpecente}	\N	\N
78437ece-7543-41bd-90fb-0bcb060b12d6	\N	expense	food_grocery	16.83	2026-09-08	\N	f	t	1	1	mercado manteiga c laura	2026-08-05 07:27:37.869744+00	\N	2026-08-05 00:25:00+00	\N	\N	\N
9c1a5bbb-35ce-43ea-b1dd-9e3f0d767d63	f26b7b68-7731-4685-a0b8-4317f2ab9815	income	study_group	562.50	2026-03-04	\N	t	f	1	1	[Shibari House 75%] Plano Trimestral (Sobre Nós)	2026-08-05 13:00:45.595814+00	\N	\N	{}	shibarihouse	b233f846-f747-4c9f-882e-c832831b1189
dcaa0ad2-d967-4282-9993-127e3959ce7a	\N	expense	food_delivery	30.08	2026-09-08	\N	f	t	1	1	lanche c/ ana	2026-08-06 04:17:36.939428+00	\N	2026-08-06 04:17:00+00	\N	\N	\N
7c51ee01-c170-41d4-9847-fa009e897e7e	\N	expense	food_grocery	9.99	2026-09-08	\N	f	t	1	1	monster pré aula	2026-08-03 21:57:40.26527+00	\N	2026-08-03 21:57:00+00	\N	\N	\N
2f9d9a1a-d833-4ee6-b0db-86b3f1892944	\N	expense	health	104.04	2026-08-08	\N	f	t	1	3	Evortia Antidepressivo	2026-08-03 09:48:17.669095+00	\N	2026-07-22 20:11:00+00	{psiquiatria}	\N	\N
fcda6915-283b-46da-824e-2f5118abbc63	\N	income	session	362.50	2026-08-01	2026-08-14	f	f	4	4	Pacote Sessões Helena	2026-08-01 08:15:29.201492+00	858e4861-2008-49e2-9e64-237d80a1b538	2026-08-01 09:19:00+00	\N	\N	\N
db0dad10-c433-4e8e-a15b-49bd6d2baf29	\N	expense	food_grocery	10.00	2026-09-08	\N	f	t	1	1	Sesc Capuccino + pdq	2026-08-01 08:24:55.572077+00	\N	2026-07-31 20:17:00+00	\N	\N	\N
858e4861-2008-49e2-9e64-237d80a1b538	\N	income	session	362.50	2026-05-01	\N	f	f	1	4	Pacote Sessões Helena	2026-08-01 08:15:29.201492+00	\N	2026-05-01 09:19:00+00	\N	\N	\N
e3445ee5-d715-4b46-98bd-6cfe9b8b6906	\N	expense	health	104.04	2026-09-08	\N	t	t	2	3	Evortia Antidepressivo	2026-08-03 09:48:17.669095+00	2f9d9a1a-d833-4ee6-b0db-86b3f1892944	2026-08-22 20:11:00+00	{psiquiatria}	\N	\N
90471d10-babe-425d-bfaa-14bc64dec954	\N	expense	health	104.04	2026-10-08	\N	t	t	3	3	Evortia Antidepressivo	2026-08-03 09:48:17.669095+00	2f9d9a1a-d833-4ee6-b0db-86b3f1892944	2026-09-22 20:11:00+00	{psiquiatria}	\N	\N
09abcc22-eb6e-46ce-bd1b-e75a078d948a	\N	expense	food_grocery	40.08	2026-09-08	\N	f	t	1	1	Sonda pão; 	2026-08-01 08:26:41.497037+00	\N	2026-08-01 01:06:00+00	\N	\N	\N
0d6a9d92-200c-4ff5-91de-bb734f7327d3	\N	expense	leisure	24.90	2026-09-08	\N	f	t	1	1	vinho ester	2026-08-03 09:13:10.908148+00	\N	2026-08-01 23:26:00+00	{entorpecente}	\N	\N
a507c041-818b-4022-8ef5-92270e4d5c23	\N	expense	leisure	23.90	2026-09-08	\N	f	t	1	1	Spotify	2026-08-03 09:14:00.609065+00	\N	2026-08-01 15:24:00+00	\N	\N	\N
fb9c8ad9-c659-4e9a-be30-4bde08d0c12b	44b4db59-f10f-46f1-bef8-00281362f176	expense	business	225.00	2026-03-05	\N	f	f	1	1	[Shibari House Repasse 25%] Plano Trimestral (Teoria das Cordas)	2026-08-05 13:13:59.55748+00	\N	\N	{}	foraisso	\N
17c772a4-47e2-459d-be61-0225b295a713	\N	income	session	362.50	2026-06-01	2026-08-14	f	f	2	4	Pacote Sessões Helena	2026-08-01 08:15:29.201492+00	858e4861-2008-49e2-9e64-237d80a1b538	2026-06-01 09:19:00+00	\N	\N	\N
ed453440-f6ad-4a6b-b793-0adb1ea47bf2	\N	income	session	362.50	2026-07-01	2026-08-14	f	f	3	4	Pacote Sessões Helena	2026-08-01 08:15:29.201492+00	858e4861-2008-49e2-9e64-237d80a1b538	2026-07-01 09:19:00+00	\N	\N	\N
8b68c9ab-98c7-4e91-9997-9ac031496828	\N	expense	food_grocery	30.25	2026-09-08	\N	f	t	1	1	sonda 2x lasagna trakinas	2026-08-08 00:56:59.089535+00	\N	2026-08-08 00:56:58.614+00	\N	\N	\N
c16f6f0d-8c3f-40bf-8f28-35383d05b37c	\N	expense	transport_public	21.20	2026-09-08	\N	f	t	1	1	bilhete único 	2026-08-08 02:11:50.226804+00	\N	2026-08-08 02:11:50.138+00	\N	\N	\N
8f6221a4-15b5-4271-9ea8-2b7d91e7f121	\N	expense	housing	1084.36	2026-08-08	2026-08-11	f	f	1	1	Fatura do Cartão	2026-08-11 11:35:23.576932+00	\N	2026-08-11 11:35:23.459+00	{}	\N	\N
c9466c4f-1d77-4dcc-ba7d-5dadd20ed26b	\N	expense	transport_public	21.20	2026-09-08	\N	f	t	1	1	bilhete único 	2026-08-12 02:21:16.322168+00	\N	2026-08-12 02:21:16.043+00	\N	\N	\N
cb5656cf-8b27-4d36-918b-78232bd8ce98	\N	expense	food_delivery	30.00	2026-09-08	\N	f	t	1	1	pompeu 	2026-08-12 02:29:17.7515+00	\N	2026-08-07 21:08:00+00	\N	\N	\N
ce0b371e-4931-4410-a1d9-01d63010d6e9	\N	expense	food_delivery	40.00	2026-09-08	\N	f	t	1	1	Abud ester shawarma coca	2026-08-12 02:32:01.288637+00	\N	2026-08-08 22:09:00+00	\N	\N	\N
5c1d3cd4-fad1-480a-9136-67fbb9d41d21	\N	expense	leisure	24.00	2026-09-08	\N	f	t	1	1	Breja Becks mari Malena 	2026-08-12 02:33:15.443676+00	\N	2026-08-08 23:59:00+00	{entorpecente}	\N	\N
b3ded8fe-5f0f-42f8-b425-d34b648ecf47	\N	expense	food_delivery	46.00	2026-09-08	\N	f	t	1	1	Pompeu milanesa coca	2026-08-12 02:34:21.070942+00	\N	2026-08-10 02:36:00+00	\N	\N	\N
1baad424-a818-4ed7-b32e-5315e8bc956a	\N	expense	leisure	18.50	2026-09-08	\N	f	t	1	1	Feeld majestic	2026-08-12 02:35:36.071137+00	\N	2026-08-10 04:38:00+00	{putaria}	\N	\N
650fbf26-c113-4f7e-8c4e-4d4c4af1fbf7	\N	expense	leisure	96.99	2026-09-08	\N	f	t	1	1	Google One	2026-08-12 02:36:00.506341+00	\N	2026-08-10 07:14:00+00	\N	\N	\N
d8be74df-7337-486d-a5b8-0f4f45c2519c	\N	expense	food_delivery	16.39	2026-09-08	\N	f	t	1	1	Esfiha E café sonda	2026-08-12 02:45:47.477015+00	\N	2026-08-10 20:39:00+00	\N	\N	\N
6a87f874-b3d3-4dc2-9d5d-b01d29f992f4	\N	expense	food_delivery	15.00	2026-09-08	\N	f	t	1	1	Açai vanesaa	2026-08-12 02:46:34.563344+00	\N	2026-08-10 22:17:00+00	\N	\N	\N
801379f2-881f-4ef3-8de3-2ce1508c68bf	\N	expense	food_delivery	25.00	2026-09-08	\N	f	t	1	1	Refeição pós teoria 	2026-08-12 02:49:19.988026+00	\N	2026-08-11 02:34:00+00	\N	\N	\N
d5ebc043-476e-4e97-b893-6fd567b67c6b	\N	expense	leisure	9.50	2026-09-08	\N	f	t	1	1	Cerveja pós teoria	2026-08-12 02:50:03.889931+00	\N	2026-08-11 02:34:00+00	{entorpecente}	\N	\N
dcdd349b-1416-49d1-b348-578de8b713f5	\N	expense	food_delivery	12.50	2026-09-08	\N	f	t	1	1	Sesc salgado e salada	2026-08-12 02:50:52.334619+00	\N	2026-08-11 21:36:00+00	\N	\N	\N
2cea5273-f6ba-491e-870e-3e715e42beca	\N	expense	housing	3.25	2026-09-08	\N	f	t	1	1	água oxigenada	2026-08-12 02:58:18.124005+00	\N	2026-08-11 23:08:00+00	\N	\N	\N
53a93764-207f-4b2d-bcf2-adb5755dcad1	\N	expense	food_delivery	9.99	2026-09-08	\N	f	t	1	1	sonda cappuccino clássico 	2026-08-12 02:58:55.346615+00	\N	2026-08-11 23:11:00+00	\N	\N	\N
b1c89bf7-2a97-4093-992e-e160dda425da	\N	expense	food_grocery	28.56	2026-09-08	\N	f	t	1	1	sonda pai coca biscoits sabonete 	2026-08-12 03:00:08.025354+00	\N	2026-08-11 23:47:00+00	\N	\N	\N
d1c5f846-a8b5-4131-abe8-0bb68a25c9ee	\N	expense	food_grocery	9.99	2026-09-08	\N	f	t	1	1	monster 	2026-08-14 15:32:09.280322+00	\N	2026-08-14 15:32:09.022+00	\N	\N	\N
9cdfa613-ca2f-4dad-a230-ea7368b176c6	\N	expense	health	52.32	2026-09-08	\N	f	t	1	1	Carbolitium	2026-08-12 02:54:21.39079+00	\N	2026-08-11 23:09:00+00	{psiquiatria}	\N	\N
50bb7561-4beb-4966-8ff7-c8439a33b85d	\N	expense	unforeseen	333.25	2025-12-08	\N	f	t	1	12	Samsung S25	2026-08-12 08:58:19.444253+00	\N	2025-11-10 20:12:00+00	\N	\N	\N
915ea0dc-998a-4570-88b5-caae8a4964f1	\N	expense	food_delivery	30.00	2026-09-08	2026-08-13	f	t	1	1	pompeu janta 	2026-08-13 03:14:22.884247+00	\N	2026-08-13 03:14:00+00	\N	\N	\N
ed83acba-3361-41ef-af7d-6e0e528e74fb	\N	expense	unforeseen	333.25	2026-01-08	\N	t	t	2	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2025-12-10 20:12:00+00	{}	\N	\N
39695245-1983-4e26-b8ba-67124660fd35	\N	expense	unforeseen	333.25	2026-02-08	\N	t	t	3	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-01-10 20:12:00+00	{}	\N	\N
da4f2b49-7fc5-4014-9e5a-227d23346d6e	\N	expense	unforeseen	333.25	2026-03-08	\N	t	t	4	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-02-10 20:12:00+00	{}	\N	\N
c0b7bb95-dd10-420c-8167-11b8c6a701d0	\N	expense	unforeseen	333.25	2026-04-08	\N	t	t	5	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-03-10 20:12:00+00	{}	\N	\N
11730f5a-34c0-46ed-9f58-3c8038c3360c	\N	expense	unforeseen	333.25	2026-05-08	\N	t	t	6	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-04-10 20:12:00+00	{}	\N	\N
ee7d0f82-2619-407d-8e04-b67391bcfcab	\N	expense	unforeseen	333.25	2026-06-08	\N	t	t	7	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-05-10 20:12:00+00	{}	\N	\N
2ae7d23a-c14b-47a7-9588-d5dbea08f33e	\N	expense	unforeseen	333.25	2026-07-08	\N	t	t	8	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-06-10 20:12:00+00	{}	\N	\N
da588633-e4ea-470c-8750-ad0caa3dbc84	\N	expense	unforeseen	333.25	2026-08-08	\N	t	t	9	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-07-10 20:12:00+00	{}	\N	\N
d37b9bd8-087f-47bc-b331-0d3ffaf27d19	\N	expense	unforeseen	333.25	2026-09-08	\N	t	t	10	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-08-10 20:12:00+00	{}	\N	\N
9896c12d-996c-4f67-8daf-c3c0bd3db41a	\N	expense	unforeseen	333.25	2026-10-08	\N	t	t	11	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-09-10 20:12:00+00	{}	\N	\N
4d37ad3a-5f6d-4c08-954c-70181491beaf	\N	expense	unforeseen	333.25	2026-11-08	\N	t	t	12	12	Samsung S25	2026-08-12 08:58:47.770832+00	50bb7561-4beb-4966-8ff7-c8439a33b85d	2026-10-10 20:12:00+00	{}	\N	\N
60d313ea-ae70-42de-8af6-198712b077a0	\N	expense	food_grocery	14.25	2026-09-08	\N	f	t	1	1	oxxo something	2026-08-13 09:20:38.577158+00	\N	2026-08-06 01:24:00+00	{misterio}	\N	\N
3a95e319-18d6-4880-aa62-0bc1cba67e0e	\N	expense	transport_public	21.20	2026-09-08	\N	f	t	1	1	Bilhete único	2026-08-13 09:23:59.010027+00	\N	2026-08-04 22:09:00+00	\N	\N	\N
dbf002b9-ec25-4c3d-86a6-2d559d22d24b	\N	expense	business	31.15	2026-09-08	\N	f	t	1	1	the duchy 	2026-08-12 03:01:21.170686+00	\N	2026-08-12 00:17:00+00	{duchy,shibari}	\N	\N
b7058a63-53aa-4ead-ad1b-4db3a09432b7	\N	expense	business	87.45	2026-09-08	\N	f	t	1	1	Assinatura baderna.bond	2026-08-12 02:30:53.913226+00	\N	2026-08-07 05:15:00+00	{conteudo,site,baderna}	\N	\N
845344b6-10bf-499b-96bc-13652f965ab3	\N	expense	leisure	1.09	2026-09-08	\N	f	t	1	1	IOF de compra internacional (duchy)	2026-08-13 10:09:30.825703+00	\N	2026-08-12 12:00:00+00	{duchy}	\N	\N
b4c0aac6-0c90-4dbb-b4d7-2f4cd5d5f8ee	\N	expense	leisure	100.00	2026-08-01	\N	f	f	1	1	raio	2026-08-13 10:46:23.053677+00	\N	2026-08-01 17:14:00+00	{entorpecente}	\N	\N
9dd41b9a-163f-4568-bbae-0fb8ce95de54	\N	expense	leisure	46.00	2026-08-09	\N	f	f	1	1	Cerveja Karaoke	2026-08-13 10:47:22.920344+00	\N	2026-08-09 03:14:00+00	{entorpecente}	\N	\N
eb36df0f-5f76-40ae-90fa-4bd9ecd2ca39	\N	expense	leisure	55.00	2026-08-09	\N	f	f	1	1	raio	2026-08-13 10:48:23.751488+00	\N	2026-08-09 03:51:00+00	{entorpecente}	\N	\N
5f3c06cf-8508-4609-8adf-9d6c2e761054	\N	expense	food_delivery	14.00	2026-09-08	\N	f	t	1	1	sesc tigelinha	2026-08-13 22:27:30.868628+00	\N	2026-08-13 22:27:30.663+00	\N	\N	\N
cec9b1e3-a9d4-4c4f-bf68-b996db44d0a1	\N	expense	food_grocery	22.11	2026-09-08	\N	f	t	1	1	sonda lasagna pão monster	2026-08-14 00:56:36.431904+00	\N	2026-08-14 00:56:36.262+00	\N	\N	\N
68ea3f6b-fdc2-42da-8cba-625f13a787f4	\N	expense	food_delivery	6.48	2026-09-08	\N	f	t	1	1	esfiha de carne	2026-08-14 15:32:35.542756+00	\N	2026-08-14 15:32:35.358+00	\N	\N	\N
1cf1d7a8-3bbe-4601-aab7-e5e055bfb86c	\N	expense	food_grocery	3.99	2026-09-08	\N	f	t	1	1	oxxo trento	2026-08-14 21:30:20.926005+00	\N	2026-08-14 21:30:19.575+00	\N	\N	\N
d98158a1-9708-4910-9f58-39f6b0600e10	\N	expense	leisure	47.00	2026-08-14	2026-08-14	f	f	1	1	2 vinho	2026-08-14 21:30:46.563879+00	\N	2026-08-14 21:30:46.345+00	{entorpecente}	\N	\N
f60fa674-c943-4f65-80cf-ece675c9fe0c	\N	expense	health	8.19	2026-09-08	\N	f	t	1	1	gilette	2026-08-22 00:16:57.929625+00	\N	2026-08-22 00:16:57.761+00	\N	\N	\N
d16be21f-5418-40f9-b3fc-4bf018906983	\N	expense	food_grocery	36.00	2026-09-08	\N	f	t	1	1	abud	2026-08-15 17:14:44.029619+00	\N	2026-08-15 17:14:43.023+00	\N	\N	\N
fd3826a4-5797-4690-90d6-df447ed89cf7	\N	expense	food_delivery	21.00	2026-09-08	\N	f	t	1	1	dogao	2026-08-16 04:04:30.952464+00	\N	2026-08-16 04:04:30.851+00	\N	\N	\N
05abb82e-8315-41f8-a569-43b1ba265989	\N	expense	leisure	15.00	2026-09-08	\N	f	t	1	1	água bomberinho	2026-08-16 05:41:48.18094+00	\N	2026-08-16 05:41:48.014+00	\N	\N	\N
a01f02d5-3e07-4058-99c0-9df54931f282	\N	expense	leisure	13.08	2026-09-08	\N	f	t	1	1	tadala	2026-08-16 06:24:45.918879+00	\N	2026-08-16 06:24:45.796+00	\N	\N	\N
4efdeb8b-eeb2-4792-abfa-49e2e582974b	\N	expense	health	6.99	2026-09-08	\N	f	t	1	1	soro	2026-08-16 06:25:23.315619+00	\N	2026-08-16 06:25:23.074+00	\N	\N	\N
2c3dc6db-59a0-4c24-a524-0e370002746c	\N	expense	food_delivery	28.00	2026-09-08	\N	f	t	1	1	café da manhã bamboo	2026-08-16 06:27:50.738091+00	\N	2026-08-15 10:37:00+00	{nina}	\N	\N
06a01907-6ea1-4006-b5cb-5e3d9361f621	\N	expense	housing	41.97	2026-08-10	2026-09-09	f	f	1	1	Internet Claro	2026-09-09 21:05:42.616702+00	\N	2026-09-09 21:05:42.387+00	{}	\N	\N
dc6cf2e8-392c-43dd-9c0b-23234ad62fbc	\N	expense	housing	36.15	2026-08-10	2026-09-09	f	f	1	1	Conta de Luz	2026-09-09 21:06:44.557496+00	\N	2026-09-09 21:06:44.146+00	{}	\N	\N
08523779-cd6e-4008-819c-8a50db9aecc1	\N	expense	housing	157.14	2026-08-05	2026-09-09	f	f	1	1	TIM Celular	2026-09-09 21:06:45.88807+00	\N	2026-09-09 21:06:45.729+00	{}	\N	\N
6e8d5df4-d23b-4743-9d2d-0283a1c5386d	\N	income	business	1188.75	2026-09-09	\N	f	f	1	1	[QUITAR FIALN] Recebimento líquido — repasses ShibariHouse → Foraisso	2026-09-09 21:31:08.913809+00	\N	\N	{}	\N	\N
\.


--
-- Data for Name: fiatt_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiatt_sessions" ("id", "person_id", "session_date", "incidents", "feedback_received", "transaction_id", "created_at") FROM stdin;
\.


--
-- Data for Name: fiorc_commitments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_commitments" ("id", "user_id", "name", "category_type", "split_rule", "default_amount", "due_day", "is_active", "created_at") FROM stdin;
\.


--
-- Data for Name: fiorc_house_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_house_settings" ("id", "user_id", "active_roommates_count", "updated_at") FROM stdin;
7f3d68ec-e8a6-4cde-9894-5f8994657fcf	d25b6046-8cd6-48e5-b8f2-78373bc1818c	3	2026-09-09 21:00:28.051+00
\.


--
-- Data for Name: fiorc_monthly_commitments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_monthly_commitments" ("id", "commitment_id", "month_year", "total_amount", "user_calculated_share", "is_paid", "is_active", "transaction_id", "created_at") FROM stdin;
\.


--
-- Data for Name: fiorc_monthly_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_monthly_targets" ("id", "month_year", "commitments", "credit_card_total", "total_target", "notes", "created_at") FROM stdin;
0ee98147-dd0d-491e-a4d6-e17a3ff2fb2e	2026-09-01	[{"id": "e7ba8b5f-00fa-44a7-a02e-1cb886def136", "name": "Fatura do Cartão", "amount": 1539.47, "due_day": 8, "is_paid": false, "is_active": true, "split_rule": "none", "receivables": {}, "category_type": "fixed", "transaction_id": "8f6221a4-15b5-4271-9ea8-2b7d91e7f121", "user_calculated_share": 1539.47}, {"id": "9d0da825-87fb-45cc-ac1a-c6376b2a384d", "name": "Internet Claro", "amount": 125.9, "due_day": 10, "is_paid": false, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 41.97, "roommate_c": 41.97}, "category_type": "fixed", "user_calculated_share": 41.97}, {"id": "4b97b539-f820-434b-8c34-4af375f2497f", "name": "Conta de Luz", "amount": 122.18, "due_day": 10, "is_paid": false, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 40.73, "roommate_c": 40.73}, "category_type": "fixed", "user_calculated_share": 40.73}, {"id": "default-estudoshibariassinatura", "name": "Estudo Shibari (Assinatura)", "amount": 15, "due_day": 10, "is_paid": false, "is_active": true, "split_rule": "none", "receivables": {}, "category_type": "fixed", "user_calculated_share": 15}, {"id": "d7075ce4-9846-4de7-97d9-b76b6f268d63", "name": "Reserva", "amount": 150, "due_day": 5, "is_paid": false, "is_active": false, "split_rule": "none", "receivables": {}, "category_type": "optional", "user_calculated_share": 150}, {"id": "default-timcelular", "name": "TIM Celular", "amount": 314.27, "due_day": 5, "is_paid": false, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 157.14}, "category_type": "fixed", "user_calculated_share": 157.14}, {"id": "37c0da16-3557-4679-8095-29aa32ff60a3", "name": "Aluguel", "amount": 3366.14, "due_day": 10, "is_paid": false, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1161.32, "roommate_c": 1161.32}, "category_type": "fixed", "user_calculated_share": 1043.5}]	0.00	2837.81	\N	2026-07-24 09:10:43.18795+00
55e46ade-423d-4e3a-a1fd-064b34024caf	2025-07-01	[{"id": "2b49d0ea-88d8-4c7e-bc69-5bff3717ded5", "name": "Aluguel + Condomínio", "amount": 3309.61, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "9966d69d-8cb9-4061-99c2-d267d1943c0e", "name": "Conta de Luz", "amount": 92.38, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}]	0.00	3401.99	\N	2026-08-01 11:19:00.426994+00
42bcabb9-848b-41e1-a075-f404bc72a472	2025-08-01	[{"id": "3f6144e5-5c08-496e-9e67-b9c68445b86a", "name": "Aluguel + Condomínio", "amount": 3336.05, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "e61db843-936c-4c04-bdd1-1ef3d03734de", "name": "Conta de Luz", "amount": 121.08, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}]	0.00	3457.13	\N	2026-08-01 11:19:00.426994+00
b66a0e89-4c96-44cb-b798-c7de3379df09	2026-10-01	\N	0.00	0.00	\N	2026-07-31 08:47:56.82944+00
32bb6521-9290-4e66-9064-745471ac45d3	2026-07-01	[{"id": "7db62b68-0bae-4be9-9959-8aca5ebbdb5b", "name": "Aluguel + Condomínio", "amount": 3344.19, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1153.75, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 2190.44}, {"id": "1275e97f-7962-462e-ac83-7f18acd150a1", "name": "Conta de Luz", "amount": 112.89, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 56.45, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 56.45}, {"id": "ca2b3558-e0ef-4bc7-b142-fba5e74989e8", "name": "Internet Claro", "amount": 131.97, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 65.99, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 65.99}, {"id": "4cbf737f-e218-4fe5-a7a2-13b0f0116aa0", "name": "TIM Celular", "amount": 264.12, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 132.06}, "category_type": "fixed", "user_calculated_share": 132.06}]	0.00	2444.94	julho	2026-07-24 07:58:44.644135+00
b5210737-e054-40bd-a8af-4f2625572ebf	2025-09-01	[{"id": "d3c5c43a-4e2a-4a22-b3a0-ee9d54de2747", "name": "Aluguel + Condomínio", "amount": 3341.3, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "4e74636a-0622-4ea4-9562-d9f17748c25d", "name": "Conta de Luz", "amount": 119.07, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}]	0.00	3460.37	\N	2026-08-01 11:19:00.426994+00
99bdf121-4303-4d1a-bd2d-1dc4cf21c522	2025-10-01	[{"id": "b8dc3d22-7775-407a-83f2-4b3cb3546729", "name": "Aluguel + Condomínio", "amount": 3402.36, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "7d6e0fce-e7c7-491a-b45a-87d5c87b1b59", "name": "Conta de Luz", "amount": 144.37, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}]	0.00	3546.73	\N	2026-08-01 11:19:00.426994+00
99af113f-98f3-456d-ad5d-36b08632e137	2026-03-01	[{"id": "41a9b8ee-0d5c-4bd7-8300-0e8bb04d0945", "name": "Aluguel + Condomínio", "amount": 3340.04, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "b1badae8-db1c-4580-a21a-3cbdeb8c5df6", "name": "Conta de Luz", "amount": 119.26, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "4323080f-8e07-491f-8d2c-7c1efe144c77", "name": "Internet Claro", "amount": 125.9, "due_day": 20, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "b64498f3-6c72-417b-9c27-1d6e26e041d2", "name": "TIM Celular", "amount": 307.52, "due_day": 10, "is_paid": true, "split_rule": "mobile_shared", "category_type": "fixed"}]	0.00	3892.72	\N	2026-08-01 11:19:00.426994+00
8a6b4f23-43e3-4b16-86cb-4aaf8c31907b	2025-11-01	[{"id": "9fd86417-f252-47aa-9dd5-37fa901cfb45", "name": "Aluguel + Condomínio", "amount": 3400.81, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "7a6c7099-383c-4f51-9fd1-e593ae2467ae", "name": "Conta de Luz", "amount": 124, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "7b670931-f40d-4d5a-a946-e931887a76d6", "name": "TIM Celular", "amount": 178.02, "due_day": 10, "is_paid": true, "split_rule": "mobile_shared", "category_type": "fixed"}]	0.00	3702.83	\N	2026-08-01 11:19:00.426994+00
768c4745-5a59-4fe0-bb9a-6270d134b9db	2025-12-01	[{"id": "ba132655-303e-4834-8331-e0337ffa83d5", "name": "Aluguel + Condomínio", "amount": 3447.2799999999997, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "98400c39-d62e-4217-9f4a-7506123ddef3", "name": "Conta de Luz", "amount": 138, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "fb90e3f5-6c13-4e52-bba0-3d8fecf529dc", "name": "TIM Celular", "amount": 209.99, "due_day": 10, "is_paid": true, "split_rule": "mobile_shared", "category_type": "fixed"}]	0.00	3795.27	\N	2026-08-01 11:19:00.426994+00
de2e6513-155f-47f6-b321-00c45d0396c6	2026-01-01	[{"id": "03647326-d260-4719-a1c6-adcbda982bed", "name": "Aluguel + Condomínio", "amount": 3429.34, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "e15905f2-f48d-41cf-9db9-2732d0f748aa", "name": "Conta de Luz", "amount": 127.97, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "3b01aef7-7428-436e-93ed-3ccd15266bd5", "name": "TIM Celular", "amount": 209.99, "due_day": 10, "is_paid": true, "split_rule": "mobile_shared", "category_type": "fixed"}]	0.00	3767.30	\N	2026-08-01 11:19:00.426994+00
2cb865b8-3377-4e4e-a93f-84efe65e6b0b	2026-02-01	[{"id": "729a81d2-d3a7-41cd-bbfc-a21d8bc1f8d4", "name": "Aluguel + Condomínio", "amount": 3431.73, "due_day": 10, "is_paid": true, "split_rule": "weighted_rent", "category_type": "fixed"}, {"id": "bb6581bc-285b-4af0-985a-abab07af24a0", "name": "Conta de Luz", "amount": 130.75, "due_day": 15, "is_paid": true, "split_rule": "equal_roommates", "category_type": "fixed"}, {"id": "418b8b16-7399-4bfd-af22-f20989c5f813", "name": "TIM Celular", "amount": 214.26, "due_day": 10, "is_paid": true, "split_rule": "mobile_shared", "category_type": "fixed"}]	0.00	3776.74	\N	2026-08-01 11:19:00.426994+00
6aa228e0-979d-4d91-b5e9-3b2fb4d49d07	2026-06-01	[{"id": "98e4c991-45fa-484d-8f1c-51244d58d7fe", "name": "Aluguel + Condomínio", "amount": 3291.25, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1135.48, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 2155.77}, {"id": "c6eb5a35-6b74-4cb8-9fa0-ab63c40b70f8", "name": "Conta de Luz", "amount": 116.26, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 58.13, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 58.13}, {"id": "a8511902-e3a4-47b1-a06e-240c0d2f86e8", "name": "Internet Claro", "amount": 129.08, "due_day": 20, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 64.54, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 64.54}, {"id": "3cb08774-f193-45c1-ba3a-08d62bfd3e09", "name": "TIM Celular", "amount": 321.51, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 160.76}, "category_type": "fixed", "user_calculated_share": 160.76}]	0.00	2439.20	\N	2026-08-01 11:19:00.426994+00
7914706b-a8fd-4936-9201-d29e73603d5b	2026-04-01	[{"id": "36df9662-889e-4416-83ac-7d09800e2b55", "name": "Aluguel + Condomínio", "amount": 3476.89, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1199.53, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 2277.36}, {"id": "508928a1-5170-4c5f-8e8b-6ee3484e3cc1", "name": "Conta de Luz", "amount": 119.26, "due_day": 12, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 59.63, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 59.63}, {"id": "55a0a254-e4d5-4d1e-ae60-3e967f3b0068", "name": "Internet Claro", "amount": 128.88, "due_day": 20, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 64.44, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 64.44}, {"id": "22a8fddb-a03f-48eb-8757-58facdbca352", "name": "TIM Celular", "amount": 307.52, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 153.76}, "category_type": "fixed", "user_calculated_share": 153.76}, {"id": "ad612523-f9c1-4c19-b540-6adcad1df88a", "name": "Fatura do Cartão", "amount": 47.32, "due_day": 8, "is_paid": false, "is_active": true, "split_rule": "none", "receivables": {}, "category_type": "fixed", "user_calculated_share": 47.32}]	0.00	2602.51	\N	2026-08-01 11:19:00.426994+00
c26f0d75-3125-414a-acbf-21bf29b2e4bd	2026-08-01	[{"id": "5082b106-6e78-4628-ad8c-aa9bab17c34c", "name": "Aluguel + Condomínio", "amount": 3399.02, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1172.66, "roommate_c": 1172.66}, "category_type": "fixed", "transaction_id": "c1f0fdd5-6f0e-4e82-96b6-c393cd749f15", "user_calculated_share": 1053.7}, {"id": "e7ba8b5f-00fa-44a7-a02e-1cb886def136", "name": "Fatura do Cartão", "amount": 1318.73, "due_day": 8, "is_paid": true, "is_active": true, "split_rule": "none", "receivables": {}, "category_type": "fixed", "transaction_id": "8f6221a4-15b5-4271-9ea8-2b7d91e7f121", "user_calculated_share": 1318.73}, {"id": "9d0da825-87fb-45cc-ac1a-c6376b2a384d", "name": "Internet Claro", "amount": 125.9, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 41.97, "roommate_c": 41.97}, "category_type": "fixed", "transaction_id": "06a01907-6ea1-4006-b5cb-5e3d9361f621", "user_calculated_share": 41.97}, {"id": "4b97b539-f820-434b-8c34-4af375f2497f", "name": "Conta de Luz", "amount": 108.46, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 36.15, "roommate_c": 36.15}, "category_type": "fixed", "transaction_id": "dc6cf2e8-392c-43dd-9c0b-23234ad62fbc", "user_calculated_share": 36.15}, {"id": "default-estudoshibariassinatura", "name": "Estudo Shibari (Assinatura)", "amount": 15, "due_day": 10, "is_paid": false, "is_active": true, "split_rule": "none", "receivables": {}, "category_type": "fixed", "user_calculated_share": 15}, {"id": "d7075ce4-9846-4de7-97d9-b76b6f268d63", "name": "Reserva", "amount": 150, "due_day": 5, "is_paid": false, "is_active": false, "split_rule": "none", "receivables": {}, "category_type": "optional", "user_calculated_share": 150}, {"id": "default-timcelular", "name": "TIM Celular", "amount": 314.27, "due_day": 5, "is_paid": true, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 157.14}, "category_type": "fixed", "transaction_id": "08523779-cd6e-4008-819c-8a50db9aecc1", "user_calculated_share": 157.14}]	0.00	2622.69	\N	2026-07-24 09:13:07.689385+00
61615fa1-eb7f-4e3e-83d2-b0c1e1146404	2026-05-01	[{"id": "62f44329-8e4e-4423-8221-fa3c30fca228", "name": "Aluguel + Condomínio", "amount": 3303.6, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "weighted_rent", "receivables": {"roommate_b": 1139.74, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 2163.86}, {"id": "219c932b-7818-4b23-a245-94d4026ef93a", "name": "Conta de Luz", "amount": 129.55, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 64.78, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 64.78}, {"id": "8fc54f8a-9f57-4867-bd22-56cc259325fc", "name": "Internet Claro", "amount": 125.9, "due_day": 20, "is_paid": true, "is_active": true, "split_rule": "equal_roommates", "receivables": {"roommate_b": 62.95, "roommate_c": 0}, "category_type": "fixed", "user_calculated_share": 62.95}, {"id": "a5109d64-028c-4b69-9fd4-4f45eda302c7", "name": "TIM Celular", "amount": 323.91, "due_day": 10, "is_paid": true, "is_active": true, "split_rule": "mobile_shared", "receivables": {"mother": 161.96}, "category_type": "fixed", "user_calculated_share": 161.96}]	0.00	2453.55	\N	2026-08-01 11:19:00.426994+00
\.


--
-- Data for Name: fiorc_rent_boletos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiorc_rent_boletos" ("id", "month_year", "rent_amount", "condo_measured", "condo_credit_prev_month", "file_path", "raw_ocr_json", "created_at") FROM stdin;
7383187f-3d91-43d6-b9bb-eefe442f4bb4	2026-07-01	2770.00	600.00	-25.81	\N	{"candidates": [{"index": 0, "content": {"role": "model", "parts": [{"text": "{\\n  \\"rent_amount\\": 2770.00,\\n  \\"condo_measured\\": 600.00,\\n  \\"condo_credit_prev_month\\": -25.81,\\n  \\"total_payable\\": 3344.19\\n}", "thoughtSignature": "EjQKMgERTTIPNfsTjALRjw/M2gSYGR3XUzeh4pEamTywY3vKIKfrtOKgH7lUwkpNPKFE+WLg"}]}, "finishReason": "STOP"}], "responseId": "7hljapa_G5rfz7IP46_ZiAk", "modelVersion": "gemini-3.5-flash-lite", "usageMetadata": {"serviceTier": "standard", "totalTokenCount": 782, "promptTokenCount": 713, "promptTokensDetails": [{"modality": "IMAGE", "tokenCount": 532}, {"modality": "TEXT", "tokenCount": 181}], "candidatesTokenCount": 69}}	2026-07-24 07:53:20.200533+00
dd96cb63-36c5-4e31-93ac-61d3a7561d22	2026-08-01	2770.00	620.00	9.02	\N	{"candidates": [{"index": 0, "content": {"role": "model", "parts": [{"text": "{\\n  \\"rent_amount\\": 2770.00,\\n  \\"condo_measured\\": 620.00,\\n  \\"condo_credit_prev_month\\": 0.00,\\n  \\"total_payable\\": 3399.02\\n}", "thoughtSignature": "EjQKMgERTTIPSQpVM88sBq9aMXKDns8I6qOF0fw+PWfce9EJ5iMoYa5fRrycTRKCyeTinZOd"}]}, "finishReason": "STOP"}], "responseId": "6J9taqbVNouyqtsP7pGNuQ0", "modelVersion": "gemini-3.5-flash-lite", "usageMetadata": {"serviceTier": "standard", "totalTokenCount": 769, "promptTokenCount": 701, "promptTokensDetails": [{"modality": "IMAGE", "tokenCount": 520}, {"modality": "TEXT", "tokenCount": 181}], "candidatesTokenCount": 68}}	2026-08-01 07:27:38.887727+00
7aab8050-d851-4e6d-96ce-585a08780d2a	2026-09-01	2770.00	620.00	-23.86	\N	{"candidates": [{"index": 0, "content": {"role": "model", "parts": [{"text": "{\\n  \\"rent_amount\\": 2770.00,\\n  \\"condo_measured\\": 620.00,\\n  \\"condo_credit_prev_month\\": -23.86,\\n  \\"total_payable\\": 3366.14\\n}", "thoughtSignature": "El4KXAERTTIPZfJESNw2SAAmZmmD8ATmnJEm63A1SF0BKAeLbnPYhMg95JrtktNaNIiDTgM0SIKL1mtxLVIwXOf3//dW0kY2f12YM+gB5gj0Y8Jrb+Az1S/B6jcaq80H"}]}, "finishReason": "STOP"}], "responseId": "XMKhavybKffQz7IPqPLjmQI", "modelVersion": "gemini-3.5-flash-lite", "usageMetadata": {"serviceTier": "standard", "totalTokenCount": 790, "promptTokenCount": 721, "promptTokensDetails": [{"modality": "TEXT", "tokenCount": 201}, {"modality": "IMAGE", "tokenCount": 520}], "candidatesTokenCount": 69}}	2026-09-09 20:32:56.26772+00
\.


--
-- Data for Name: fiteo_class_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiteo_class_schedules" ("id", "class_date", "proposed_theme", "minutes_and_notes", "is_planned", "created_at", "course_id", "theme_description", "techniques", "has_photo_content", "has_video_content", "is_highlighted", "is_cancelled") FROM stdin;
b58862c3-37de-458f-84bf-606d6e8f1862	2026-06-29 22:30:00+00	TK Gorgone	tay + gabs\ndomi + robs\n\nlucas short queda de pressão	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{"Takate Kote","trava em L",stemless,"3a linha gorgone"}	f	f	f	f
56411e79-f129-440d-838d-36518b11c57b	2026-06-22 22:30:00+00	TK mt fuji	gabs + malena\ndominic + nina\ntay + cobianchi\n\ntay fez pseudo cadeira lateral\ndominic fez basket + tk front	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{"Takate Kote","mt fuji","cadeira lateral",basket,"tk front"}	f	f	f	f
bd3f9054-c837-4b9c-a926-970181cca1ff	2026-07-15 22:30:00+00	usagi do kinoko + swan	## ata 1\n\nquarta feira 15 de julho\ncisne + usagi \ncomece com um single collum unindo os pulsos. Deixe espaço para que os braços do modelo se abram um pouco quando voce levar as mãos na posição do usagi. Quando os braços do seu modelos tiverem posicionados, leve o rabo da corda em direção ao primeiro braço. Com cuidado para evitar nervos, una o antebraço à parte superior do braço. Friccao: nodome. Finalize com um “H”. Faça a mesma coisa no outro braço. \n\nTenshi\nComece com um single collum em um dos pulsos, ele não pode ficar muito apertado. Posicione o primeiro braço do modelo de maneira que fique dobrado. Você não quer tensionar muito o seu tenshi, como faria no caso de um futomomo. (…) Ao final una as partes internas dos braços com o que restou das cordas. Use essas quatro cordas pra fazer a suspensão. Ou faça uma emenda (emenda específica - shibari study). \n Os modelos foram suspensos com altura suficiente para encostarem os pés no chão, apenas para sentirem como tracionar a musculatura dos ombros e peitoral nessa posição.	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	nina modelo | bonus: tenshi	{usagi,swan,tenshi}	f	f	f	f
0eaeb482-18a1-4590-aaf0-eadbcb4ea313	2026-07-08 22:30:00+00	Mês com 5 quartas feiras	Sem aula regular (5ª quarta-feira do mês)	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{}	f	f	f	f
73afe11c-f674-4897-88ea-c07e75d31407	2026-07-01 22:30:00+00	aula araki	fotos com pucca\\nfotos com robs	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	Analise do estilo e padrões do artista Nobuyoshi Araki	{"estilo araki","padrões araki"}	t	f	f	f
b93dde44-301a-45b7-8516-30068bc6613a	2026-06-26 22:30:00+00	TK de mãos baixas para corpos com limitações	lindas fotos da razzura\\naconteceu na sexta devido a jogo do brasil na copa\\ngabs teve mta dificuldade com as mãos pra tras	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	terceira corda choking leve	{"Takate Kote",adaptações,"fricção L"}	t	f	f	f
fc235b7e-5086-4781-a4b2-2ef9a605ac60	2026-06-17 22:30:00+00	exercicio de aquecimento / make a stick / tk simples - 3a corda livre	lotus tava com uma roupa bem kill bill	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{"Takate Kote"}	f	f	f	f
9c039923-89a6-4d54-9ea4-b2fef0e9ff5a	2026-06-10 22:30:00+00	willow tie + chest harness	vanessa levantada peso livre\\nregistros nina	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	vanessa modelo c/ tengu	{"willow tie","chest harness"}	f	f	f	f
f20d5ee3-6081-4a85-8867-7cd91661e24f	2026-06-03 22:30:00+00	intimidade com a corda	exercicio rope drills\\nwillow tie\\naula excepcional	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	nina modelo	{"manejo de corda",agilidade,movimentação,friccções,"half hitch",willow,"rope drill"}	f	f	t	f
8a3d7344-58b6-4e69-9bc1-619ebe3a27ab	2026-05-27 22:30:00+00	futomomo de suspensão 2 / fricção em x	nina suspensa pelo proprio futomomo\\nmari chega no meio "COM LICENÇA"\\nFoi aniversario do lucas	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{futomomo,suspensão,"fricção em x"}	t	t	f	f
fb583514-46d1-4a8a-988b-a36ad705e1ec	2026-05-20 22:30:00+00	futomomo de suspensão 1	nina suspensa	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{futomomo,suspensão}	t	t	f	f
dbf91ce7-dbf0-4de1-a3c2-773094574e59	2026-05-06 22:30:00+00	condução e interação	\N	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{condução,interação}	t	t	f	f
6e49ef9c-a902-43d2-83ce-26d37cc0681b	2026-04-22 22:30:00+00	mari suspensa (suspensão)	mari suspensa	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{suspensão}	t	t	f	f
d2f11825-7328-4440-ba90-4ae608578dcd	2026-04-15 22:30:00+00	Não houve aula	Não houve aula	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{}	f	f	f	f
70719ab4-1076-450c-ab42-acee10725b3c	2026-04-08 22:30:00+00	shakuhashi / usagi	\N	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{shakuhashi,usagi}	t	t	f	f
b46f5c6e-ce88-4377-af72-fab830dda162	2026-04-01 22:30:00+00	fisherman + agura	vanessa fotos e videos	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{fisherman,agura}	t	t	f	f
5074da90-a098-41dd-bc1a-577970ed1d59	2026-03-25 22:30:00+00	Houve aula mas não há registro	Houve aula mas não há registro	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{}	f	f	f	f
9348e812-7f51-44f7-bada-f13551b6e5e9	2026-03-18 22:30:00+00	fisherman	\N	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{fisherman}	f	f	f	f
8780620c-2774-4d0b-bc78-e0efdfb2b93f	2026-03-11 22:30:00+00	aula dada pela Mariana Rodeso	aula dada pela Mariana Rodeso, foraisso em emergência médica	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	foraisso em emergência médica	{}	f	f	f	f
01f35759-c2ac-482e-adc8-674c2315b235	2026-03-04 22:30:00+00	futomomo espiral	primeira aula	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	primeira aula	{"futomomo espiral",futomomo}	f	f	f	f
bc23c3f4-4ce4-462e-a1b3-6f2cfb4ac3c8	2026-07-20 22:30:00+00	hiploader + butterfly	sebs + mari\ngabs + giuliana\n\n## ata 1\n\nrascunho\nsegunda-feira 20 de julho\nseguindo com a sequência das últimas aulas vamos ver a ligação do hip loader com o butterfly\né um rig difícil de lembrar, mas facilita se lembrar que o conceito do butterfly são as fricções em “L”\né difícil acertar a crescente das fricções, começa menos forte pra terminar com mais força\nsão necessárias x cordas em média\numa na primeira parte\n\ncomeça a demonstração:\n\nprimeira parte:\ninteressante lembrar da contraintuitivivade desse começo.\ncomeça passando a corda por cima de um dor ombros e por baixo do seio e depois do braço. Passe o rabo da corda por dentro do bite. A contratenção vai pro mesmo lado. preste atenção no tamanho das escapulas, a referência é o centro de gravidade do torso, por isso a altura vai mudar de acordo com o tamanho do seu modelo. essas primeiras cordas não são tensionadas demais, deixe levemente frouxo. Continuando passando a corda pro outro lado, formando um x no peito, e em seguida passando ao lado do bite, mais uma contratencao contraintuitiva , passando pro outro lado e deixando uma trama na frente. voltando pras costas passe na alça inferior logo a baixo do bite. novamente passando respectivamente por baixo e por cima das tiras formando a trama no peito. voltando pras costas, junte as duas tiras de cima, logo a cima do no principal, centralizando o que vai ser o tronco e juntando agora as tiras de baixo com um half hitch. Nesse momento o rig ainda não está totalmente tensionado. (pede que os alunos façam essa primeira etapa. A dificuldade em geral é lembrar das fricções contraintuitivas)\n\n Segunda parte:\ncuidado pra não tensionar muito essa parte,  pois seu modelo pode apresentar dificuldade pra respirar na suspensão. Passe a corda que restou da primeira parte na cintura do seu modelo.  Você provavelmente vai precisar emendar cordas. cuidado com o lugar da emenda, pra não ficar bem no lugar da fricção. Você não pode dar muita tensão nessa hora, pois  as próximas fricções vão tensionar todo o seu rig, e talvez tensione demais o diafragma. Depois de centralizar o que vai se tornar o tronco, e ajustar a tensão na cintura, feche com um nodome. Como eu quero evitar nós volumosos em cima da coluna, eu vou usar um nodome completo, voltando o sentido da sequência pra cima. Aproveite para alinhar o tronco. Suba espiralando até o nó principal da primeira parte, passe por cima da primeira alça de baixo regulando a tensão, passe n\npor baixo da alça do baixo do outro lado, voltando o sentido da amarração pra baixo. Agora vamos fazer os hishis. ( pede que os alunos façam até aqui).\n\n Terceira parte:\nnão esquenta com a simetria, isso dá pra ajudar depois\nvolte por baixo do braço, fazendo um half hitcj logo a baixo do seio do modelo, ligeiramente pra dentro da linha do mamilo. Isso tb depende da estética que você quer dar e o tamanho do diamante que você quer. Depois do half hot h siga fazendo um nodome na linha da cintura, centralizando com o umbigo. Tente não embaralhar muito as toras, isso é uma questão também estética. Faça o mesmo half hot h a baixo do outro seio. Voltando pras costas do modelo, de uma volta no tronco passando por baixo dele. uma todas as toras de um lado com uma fricção em l. Passe por baixo do tronco e por cima da outra faixa, unindo todas as tiras. Você vai unir três passadas de corda em cada tira com uma feição nesse momento. Aproveite para ajustar a tensão das cordas, quanto mais cordas, maior a tora, e mais difícil de equilibrar a tensão de todas as cordas. Continue passando por baixo do tronco e depois por cima. (pede que os alunos acompanhem)\n\nQuarta parte:\nPasse por baixo do tronco, levando a corda pra frente do modelo, por baixo do braço e a cima do seio, encaixando a alça num lugar confortável da clavícula do seu modelo, fazendo uma reversão de tensão e voltando pras costas, passando por baixo da faixa anterior, aquela que passa por baixo dos seios. Passe por baixo do caule, dando uma volta completa antes de ir pro outro lado. Faça a mesma coisa do outro lado. De uma volta no caule e feche este lado com um “L”, unindo as faixas. Faça o mesmo com o outro lado. Depois desce espiralando pelo caule, e feche com um half hitch na linha da cintura. Daqui vamos seguir com o hip loader. Por isso será necessário emendar uma corda inteira.\nFim do Butterfly\n\npara continuar com o hip loader, ao invés de fazer um single collum na cintura, você vai direto dar a volta na perna do modelo. Para encaixar a corda no lugar exato, peça ao modelo que levante a perna rapidamente, assim você pode encontrar o lugar certo na virilha. É importante que essa passada tenha bastante tensão, pois ela está ligada ao butterfly, e isso faz toda diferença na sustenção do butterfly numa suspensão. Siga o hiploader como fizemos na última aula.\n\nSuspensão:\no ponto de suspensão principal é nas costas, faça um “Y” envolvendo todas as tiras e o tronco.\nVocê pode fazer mais linhas de suspensão levantando os tornozelos ou as coxas. u\n\npiadola do foraisso:\ndeixe o rabo tenso, shibari se faz com o rabo tenso se vocês repararem\n\npresentes:\nmalena\nmari rodeso\nsebs\njuliana\ngabs\nnina	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	sebs + mari\ngabs + giuliana	{hiploader,butterfly}	f	f	f	f
c802896c-1c22-47c3-af0b-a555d942173b	2026-06-15 22:30:00+00	TK assimetrico	gabs + tay	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{"Takate Kote","TK assimetrico"}	f	f	f	f
859a0cd5-41ff-427e-af00-7b91a5ccc48f	2026-08-03 22:30:00+00	butterfly + hiploader reforço	\N	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{butterfly,hiploader}	t	t	f	f
55e9b034-573e-4786-a7bd-bfcf195b5a10	2026-08-10 22:30:00+00	tk assimétrico + mermaid solo	Nina modelo\nGabs + Malena\n\n\nPresença Mari, Vanessa	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{"Takate Kote","tk assimétrico",mermaid,solo}	f	f	f	f
bc2b5e29-3e36-46ac-9be4-4670964c9c92	2026-08-17 22:30:00+00	hishi futomomo	\N	f	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{hishi,futomomo}	f	f	f	f
15a0d47a-12f3-4209-b9ec-edefb7929566	2026-05-13 22:30:00+00	tengu	cada tengu de uma cor\nTay presente	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{tengu}	f	f	f	f
9bca2a48-8059-48ef-82bb-6ebdf42c1240	2026-07-22 22:30:00+00	swan c/ tepo	filipe + amiga dele\nmalena + mari\nnina + lotus\nliliane + dudu\ntay + lucas	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{velocidade,criatividade,mordaça,teppo,swan,assimetria}	f	f	f	f
e2f94e95-5928-4a42-8af6-0bb0929ced02	2026-07-29 22:30:00+00	fisherman duchy	liliane + amiga dela\nfilipe + amiga dele\nnina + sebastian\n	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{jiai,precisão,espaçamento,simetria}	f	f	f	f
6b8cbd3a-1175-43b6-a571-e1849d9a4a2f	2026-07-13 22:30:00+00	hip loader complementando bamboo harness	gabs + malena\nvanessa\nnina\n\nata pela nina\nincidente vanessa\n\n## ata\n\nsegunda-feira, 13 de julho de 2026\ncontinuação da aula anterior com bambu\n\nhip loader (harness de cintura)\n\nEssa estrutura de harness ajuda a distribuir o peso de maneira equilibrada numa suspensão.\nNormalmente é necessário usar meia corda, uma corda, uma corda e meia caso seu modelo seja uma pessoa grande.\nÉ um harness simples, mas não deixa de ser difícil, um erro pode causar uma lesão no nervo ou se tornar muito difícil pra sua modelo aguentar tempo suficiente na suspensão. Para que isso não aconteça, é necessário encaixar as cordas no corpo da modelo com certa precisão.\nÉ um rig versátil, usa poucas cordas e pode ser feito com rapidez se você treinar. Por isso, é bom pra agregar ao seu repertório. Mas, como é um rig que necessita precisão, ele depende muito da sua prática. Além disso, ele permite que você vire seu modelo de barriga pra cima ou pra baixo, ou até de ponta cabeça, possibilitando transições bonitas.\n\nComeça a demonstração:\nComece com um single collum na cintura e feche com um sommer ville. Sugere esse fechamento, pois esse primeiro nó não pode colapsar de maneira nenhuma para que a modelo não caia. O single collum precisa deixar espaço para um pequeno “v”, por isso o sommer ville acaba ficando mais difícil, mas, mesmo assim, prefira esse fechamento pela segurança que ele oferece. Precisamos que a primeira passada em volta da perna fique bem tensa e esticada. Faça a segunda volta na perna passando embaixo da primeira volta. Se lembre de usar a contra tensão. É importante que as duas voltas da corda tenham a mesma tensão, para isso levante a segunda volta e puxe o rabo. Quando tiver uma boa tensão, trave com nodome. (A segunda volta tende a ficar um pouco mais solta, mas a ideia é que fique o mais próximo possível da primeira volta). Com o rabo da corda, volte para a cintura fazendo um fricção e indo pro outro lado. Faça a mesma coisa na outra perna. É importante que as cordas passem pela virilha da modelo, pois um pouco mais pra baixo passam nervos. Não tem problema deixar bem na virilha, pois a tensão fica mais na parte de fora das coxas. Quando você terminar de puxar as voltas da segunda perna, o primeiro nó do single collum tende a alinhar com o meio das costas. Nesse momento você tem duas opções: se o primeiro nó estiver ainda mais pro lado da primeira perna, feche com um halfhitch do lado do sommer ville, centralizando o centro de gravidade da suspensão pro meio da coluna. Se estiver bem no centro, você pode puxar direto pela primeira passada fazendo vários halfhitchs, ou passar pela cintura para gastar sua corda. Termine dando um nó pelo bite. Existe a opção de fazer um matanawa, mas você precisa tomar cuidado com ele na hora da suspensão. Além disso, na hora de suspender, passe a corda do harness de peito pelo single collum na frente, fechando com um cowhitch da cintura sem incluir o “gasto de corda”, para fazer seu diamante.\n\nSuspensão:\nPeça ao seu modelo que se incline para frente. Trave primeiro seu harness de peito feito com bambu no ponto de suspensão.\nCom o seu modelo inclinado pra frente, faça um “y” na parte de baixo das voltas nas pernas (para saber como fazer um “y”, vide: capítulo sobre suspensão). Dica: combine com um momento da música a hora de suspender o hiploader, puxe de uma vez até que a cintura do modelo esteja mais alta que o tronco, ou até que o modelo fique completamente de ponta cabeça; peça que seu modelo jogue as pernas pra traz na direção da nuca nessa hora. Com a modelo suspensa você tem várias opções de transição, amarrando a perna no bambu, por exemplo. Quando você quiser descer, você pode ir descendo o rig de cima, e deixar a modelo suspensa só com o riploader. Além disso você também pode fazer um ponto de suspensão frontal, na parte de cima do diamante, e mudar completamente a posição do rig. Nesse caso o hiploader permite isso, pois o “y” escorrega para frente por baixo das pernas. Isso permite uma série de outras opções, como por exemplo passar uma corda na cintura pela argola, curvando a lombar do modelo. Nesse caso, a modelo vai sentir mais pressão nos ombros na região da clavícula. Obs: tenha muito cuidado na hora de descer sua modelo quando o único ponto de suspensão é o hiploader, não há margem para erros nesta hora.\n\npresentes:\nvanessa\ngabs\nmalena\nnina	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	transições no hiploader + chest harness	{hiploader,"bamboo harness",transições,"chest harness"}	t	t	f	f
ce5fadaf-3466-4cc7-8e56-0826dc527673	2026-08-05 22:30:00+00	Karada de overhands / Kara de half hitchs	liliane + amigo\nju + debora\nfilipe + amiga\nanna (solo)	t	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{"half hitchs",controle,ornamentação}	f	f	f	f
396d3a16-874d-4873-b0f9-f5a8fa87082e	2026-07-27 22:30:00+00	hiploader + butterfly	Gabs + Nina\nSebs + Moça gringa\n\nPolaroid Nina\nVideos nina rodando em várias poses	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{hiploader,butterfly}	t	t	f	f
75b62d2b-8026-4743-98a9-bf2fa012262a	2026-04-27 22:30:00+00	ensaio sobre condução da sessão / cena	sebs + vaness\ntay + cobianchi\n\ncondução do bottom no shibari, conexão, cuidao, sadismo\n\ngrande teoria\nroda de conversa\n\noq é ser TOP\npropensões a entrega\ncompatibilidades\n\nOBS: destacar aula como trabalho excepcional	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{condução,conexão,cuidado,sadismo,"roda de conversa"}	f	f	t	f
88c24184-107e-4051-a4df-80b6b0358313	2026-04-20 22:30:00+00	Houve aula mas não há registro	houve aula mas não há registro	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{}	f	f	f	f
1b5b5974-68e9-4910-ad3d-1f65bbc77abe	2026-04-13 22:30:00+00	cadeirinha	sebs + moça dos states	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{cadeirinha}	f	f	f	f
b2e437d6-1596-497f-b2ef-910a79cbc7eb	2026-04-06 22:30:00+00	Não houve aula	não teve por falta quorum	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{}	f	f	f	f
13a62eb4-07fb-4ed5-94c5-ce77cf2144da	2026-09-07 22:30:00+00	Crab Tie c/ semi suspensão	Robs + marina\nLili + amigo\n\nprimeira linha de suspensão da liliane	t	2026-09-03 04:45:14.198085+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	Aula aconteceu na terça (08/09) devido ao primeiro dia de Chaotic Bodies (Gorgone)\n\nCrab Tie, composto por Moon tie e single columns (mãos + pés) ancorado na coxa.\n\nIntrodução à semi suspensão	{"moon tie","crab tie","semi suspenção"}	f	f	f	f
029e456a-60c1-4c62-96df-ab0b7715e902	2026-07-06 22:30:00+00	bamboo harness	modelo vanessa\nsebs + malena\ngabs + mrodeso\ntay + cobianchi\nATA feita pela nina\n## ata\n\nsegunda-feira 6 de julho\nPede aos alunos que escolham um bambu de acordo com a envergadura dos braços do seu modelo\n\nHarness bom pra suspensão, pra quem tá iniciando, bastante versátil apesar de parecer complexo. É muito bom pra solo, pra tortura, mesmo sendo bem confortável\nSe treinar, dá pra fazer em cinco minutos.\n\nEm média são necessárias duas cordas e meia, mas se quiser usar mais você pode enrolar nos braços no final.\n\nEle funciona bem com hip loader (próxima aula). Fica mais estável puxar a alça da cinta da cintura.\n\nComeça a demonstração:\nPrimeiro meça seu modelo e peça para ele segurar o bambu pelas costas usando o antebraço e as mãos, aproximando os cotovelos, encontrando o meio do bambu e\nprestando atenção nos anéis do bambu, pensando em travar o nó inicial.\nComeçe fazendo um single collum no meio do bambu, bastante firme pra não colapsar.\nPeça ao modelo que segure o bambu com os cotovelos, antebraços pra frente.\nCom o rabo da corda eu faça o primeiro hojo cuff em um dos braços (um pouco a cima do cotovelo pra evitar lesões, mas baixo o suficiente pra aproximar os cotovelos).\nObs: A algema do hojo cuff não precisa ficar muito apertada, pois não tem muita relação com a linha de suspensão.\nFaça o hojo cuff no outro braço, aproximando os cotovelos, tendo atenção à mobilidade de ombros do seu modelo.\nA fricção do meio é importante, pois é de onde vai sair a tira de baixo. Preste atenção no equilíbrio dos lados e trave com uma fricção, não precisa ser em “x”.\nPasse para a frente do modelo, circulando a a cintura com a corda e fechando com um nodome (se fosse o caso do hip loader, não precisaria da corda na cintura).\nPuxe em direção ao peito do modelo, calculando o tamanho do diamond (muito pequeno não fica bonito, e muito grande, por sua vez, não dá a estrutura necessária). Faça dois halfhitchs, um em cima do outro, geralmente meio do final da musculatura do peito.\nVolte para as costas do modelo, passando por trás da primeira alça, equilibrando as tensões. Circule por baixo do tronco, e passando por cima do bambu.\nVolte pra frente do modelo, abrindo o diamond ao mesmo tempo em que puxa do outro lado, garantindo equilíbrio. Passando por trás do tronco e por cima do bambu novamente. Faça o outro lado do diamond, sempre regulando a tenção e o tamanho do diamante. É importante que ele se encaixe no corpo do seu modelo.\nVolte para as costas, passando por cima do bambu e por trás do tronco, novamente. Feche com um halfhitch.\nVolte pra frente abrindo a parte de cima do harness, puxe fazendo a reversão de tensão, regulando o tamanho, prestando atenção na clavícula do modelo. Cruzando as cordas pra dar alguma fricção e estética. Passe por baixo das alças.\nMesma coisa do outro lado.\nPor último, passe por trás do tronco e pra baixo, juntando as duas tiras fazendo um L, dos dois lados.\nAgora, comece a enrolar a corda em volta do braço junto ao bambu. Nesse momento você controla o quanto você gasta de corda, caso tenha meia corda ou uma corda inteira. Tenha cuidado com as emendas de corda e os locais onde passam nervos do antebraço, e também, evitando os pulsos. Colocando pouca tensão, o suficiente pra corda não correr durante a movimentação e não tanto a ponto de formigar muito rápido. Aqui você tem liberdade estética. Volte cruzando as cordas, e deixando os cruzamentos no vão entre o braço e o bambu, evitando, mais uma vez, que os cruzamentos causem lesões. Ao chegar nas costas do modelo, a corda passa por baixo do bambu, e se liga ao outro braço passando por cima do bambu, evitando o cotovelo, continuando pelo antebraço.\nO tipo de fechamento vai depender do quanto sobrou de corda. Se necessário, abra as cordas e feche com um no simples\nou dando o nó final no bite.\n\nCom o rig, pronto a suspensão é pelo bambu. O ponto de suspensão é um “y” no bambu.\nEsse rig te dá muitas opções de movimentação e torções, por exemplo, juntando o bambu em uma das pernas ou suspendendo por ele.\n\nFinal da explicação.\n\nUm aluno questiona a necessidade do segundo halfhitch no diamond. Ele serve pra dar mais estrutura.\n\nUma aluna da ideia de usar um clove hitch no single collum inicial feito no bambu, e o professor sugere de testar, porém ele colapsa.\n\nA maioria dos alunos fez um tronco, deixando uma distância muito grande entre o bambu e a altura do tórax. Isso é importante, pois, durante a suspensão, é ele que sustenta o peso corpo do modelo. Esse rig não tem tronco pra que o bambu fique na altura correta. Se o modelo segurar o bambu inicialmente pelos cotovelos, juntando as mãos pela frente, o bambu já fica posicionado no lugar certo.\n\nSegundo os modelos, o harness exige mais das costelas.	t	2026-08-05 14:17:33.975672+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	suspensão multiplas interligadas\n\nmodelo de aula: Vanessa\n	{bambu,basket,suspensão,"suspensão múltipla"}	f	f	f	f
a8896838-df13-4ed3-a9bd-2f4d12039e56	2026-08-31 22:30:00+00	5a segunda feira do mês	\N	t	2026-09-03 04:42:05.365774+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	\N	{}	f	f	f	t
d6dfecca-c973-4e1c-b5f3-e512b62cdaeb	2026-08-24 22:30:00+00	Hishi futomomo	Gabs + menina nova\nTayse + gabriel\n\nnina modelo\n\naula não fluiu bem alunos não conseguirar fazer o hishi com conforto e funcionalidade	t	2026-08-19 19:38:53.538957+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	Recapitulação do hishi futomomo\nrevisar construção da estrutura inicial (SC +  HC)\nconstrução modular do diamond.\ntensão maior na coxa e alívio na canela\ndistribuição de forças do hishi\n\nHishi TK\n[desenvolver]	{hishi,takatekote,futomomo,tensão}	f	f	f	f
d26b7a10-eb51-47ec-95aa-793b5254b2dd	2026-04-29 22:30:00+00	Sem registros	\N	t	2026-08-14 02:57:17.181413+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	Não há registros sobre essa aula	{}	f	f	f	f
a5c24499-358b-4cb0-a444-9165752b7eae	2026-08-12 22:30:00+00	Karada Hishi / Karada kikou	Ju + debora\nfilipe + Ju\nRobs + gia	f	2026-08-05 12:22:53.273226+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{"padrão hishi","padrão kikkou",controle,equidistancia}	f	f	f	f
5a78213d-d6cd-44bd-862a-78de64a47390	2026-09-02 22:30:00+00	Shakuhashi + Fisherman	modelo mari ofugi\nandrew	t	2026-08-19 20:41:48.959639+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	Fisherman v1 duchy\nShakuhashi nas canelas com estrutura de TK\nIntrodução à segurança dos nervos	{fisherman,shakuhashi,"fricção x","fricção meia-lua",segurança,nervos}	t	f	f	f
219d920e-baa5-48a8-be49-43b1ead38c2d	2026-08-26 22:30:00+00	Hishi Torso e Tiva Harness	Modelo Razzzura\nFilipe + vanessa\nJu + debora\nliliane + amiga\nSamanta	t	2026-08-19 20:35:12.890948+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	"Karada" em hishis construído com nodomes\n\ncontinuando o estudo de karadas, esse tipo explora uma construção mais "sedimentar" em relação aos outos, no sentido que é gradual.\n\nO controle de tensão tem administração mais "modular"\n\nmodular também é a estruturação da peça. quantidade de hishis é opcional e se adapta ao corpo do modelo\n\n\nOpcional: TIVA. Adornamento extra.\nover under over under\nover the overs\nunder the unders	{takatekote,nodome,hishi,karada,simetria,espelhamento,"tensão contruída"}	f	f	f	f
1f12ee33-6343-4fdb-9305-348e0851d5ec	2026-09-09 22:30:00+00	Introdução as fricções + hishi torso	Presença de Nena\n\nAproveitando ausencia de alunos mais experientes, reforcei o hishi torso (nodomes) com o felipe\ne introduzi as fricções básicas (contra, half hitch e nodome) aos novos alunos\n\naquecimento de movimentação	t	2026-08-19 20:43:00.359755+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	Introdução às fricções básicas: contra tensão, half hitch e nodome ao alunos novos. Single Column no final\n\nReforço de Hishi Torso para o Fililpe\n\nabertura de aula com aquecimento (rope drill)	{nodome,"half hitch","single column",hishi,"rope drill"}	f	f	f	f
a1e72b18-633e-4c54-bc57-5d600f997b1c	2026-08-19 22:30:00+00	Teppo bambu	Modelo Tay\n\n\nAula originalmente seria Hish Torso harness com inuito de introduzir alunos iniciantes (felipe, ju, anna) em construção de simetria e tensão sedimentar dando seguimento ao Hishi Karada.\n\nComo nenhum dos alunos esteve presente o tema foi modificado para teppo com bambu se adaptando à aptidão e vontade da única aluna presente (Roberta)\n\nPrimeiramente a ideia era reministrar o teppo com swam mas a lesão na lombar de Tayse impediu a posição e mudamos para Teppo com bambu	t	2026-08-19 18:31:41.248856+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{teppo,bambu}	f	f	f	f
c86f29c0-de1c-4655-a13b-d077f2ee004a	2026-09-28 22:30:00+00	Karada Double Coin	\N	f	2026-08-19 20:39:37.947312+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	https://www.theduchy.com/tutorials/diamond-dress/#1568037929667-54b1596b-6183	{"double coin",karada,precisão,equidistancia}	f	f	f	f
3e499a93-7a98-49e3-b19f-3a347d570f60	2026-09-16 22:30:00+00	Make a stick + Jiai de susp	# ju boscardin + deborah\nContrução bastante rápida da estrutura\nperspricaz como sempre.\nfaltou um pouco de tensão\n\n# filipe + ju\nmandou bem na estruturação do jiai\n\nprecisa entedner tensão \natenção a detelhas\n\n#  samantha + amanda\nbelos rigs no scarpin / cinta liga\n\nprecisa estudar estruturas básicas\ne entender tensão (o que contrasta comos rigs que fez em si propria)\n\nmuito afobada para fazer estruturas complexas\n\n# Amanda\ndemonstrou habilidade prévia. revelou já ter praticado macrame.\n\n# Lili\narrasou como sempre. Figura belíssima. Perfeita distribuição no corpo\nFaltou tensão	t	2026-09-21 17:28:46.082628+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	Introdução à estrutura de suspensão com o Jiai\n\nAlunos novatos fizeram futomomo de esprial	{jiai,"futomomo espiral","make a stick"}	f	f	t	f
bd0380f5-02a4-4b56-97e2-432d7e7b1aed	2026-09-14 22:30:00+00	Jiai de suspensão + Moon tie	gabs van\nNina cassia\n\njiai susp + moonntie \n\nCassie formigou mão direita na hora do moontie\nmão inteira mas tb as costad do mindinho com mais intensidade (ulnar) \nindica sangue e nervo simultâneos \n\nparou ao soltar tudo a intensidade mair no dedinho \nmão inteira persistiu (sangue) \nCass não sabe exatamente a hora q o dedinho parou \n\nfoi suspensa por mom  pelo MT com um harness maos livres  de 3 tiras \n\nperna esquerda formigou em poucos minutos \naliviada com susp de SC na mesma perna pela nina com instrução próxima minha \n\nNina prosseguiu com DC nas mão e levantou pela frente.\n\nfez futomomo na perna dir sem susp \n\n\ngabs fez suspensão bem complexa add um futomomo esq\n\npontas dedos dir van formigou. alívio na susp e rearranjo da algema do moontie aliviou. \n\nentão pé esq formigou igual \n\npuxada pela canela direita aliviou a esq\n\n	t	2026-09-21 17:25:31.298284+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	Aula adiada para 17/09 devido ao transporte de Gorgone ao aeroporto de Guarulhos GRU	{suspensão,"moon tie",jiai}	t	t	f	f
21d1e0de-4e99-4230-a27e-c53a7acf0a5f	2026-09-21 22:30:00+00	Neko Harness + Spellbound	gabs + malena\nrobs + Fran\nModelo razzzura\n\nneko harness feito primeiro.\n\nrobs teve q refazer do zero pois Fran sentiu dificuldade de respirar na parte de cima do peito mas só qdo estavam na linha da cintura. Memso afrouxando bem, Fran ficou desconfortável no peito.\n\nexpliquei o conceito de gastar corda ANTES chegar no fim da amarração, para ajudar a encurtar os rabichos de emenda. Gabs não entendeu mto bem no começo, Robs aplicou imediatamente no spellbound de maneira muito inteligente, para q que a emenda n ficasse no meio do diamond da barriga.\n\nApesar dos contratempos robs andou bem. gabs tb amarrou rápido mas se distraiu muito em conversas. quando aplicados ambos voaram (em momentos diferentes) 	f	2026-09-21 14:22:17.785+00	d5eeb2c1-213b-4ab9-8bf2-9a981bcc9ca2	Mecanismo de alça dupla repuxada\n\noq importa é seguir as linhas naturais do corpo do modelo	{}	f	f	f	f
57ffbe62-de76-4cea-994c-5e6d1287efff	2026-09-23 22:30:00+00	shakuhashi jiai	éééé	f	2026-09-23 22:42:36.921968+00	84565ee8-ab8a-4db4-9fdf-13b52a3290db	\N	{}	f	f	f	f
\.


--
-- Data for Name: fiteo_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."fiteo_attendance" ("id", "class_id", "person_id", "present", "payment_type", "transaction_id", "created_at", "enrollment_id") FROM stdin;
ca10f0c8-7273-4f21-a901-31ddcd4ae3be	e2f94e95-5928-4a42-8af6-0bb0929ced02	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
de7870d1-bc01-450a-af20-daa1e6b1b96b	e2f94e95-5928-4a42-8af6-0bb0929ced02	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
6a6be4ab-77ec-47c3-9d7f-39d3c20358ff	e2f94e95-5928-4a42-8af6-0bb0929ced02	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
1740dcfb-1434-47ed-b7df-1804ed493e35	9bca2a48-8059-48ef-82bb-6ebdf42c1240	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
e59191a8-c172-4edf-a077-66a2c8d26d16	9bca2a48-8059-48ef-82bb-6ebdf42c1240	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
32d601c1-92bc-4173-a1bd-e23814fd2444	9bca2a48-8059-48ef-82bb-6ebdf42c1240	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
312b5805-4e0d-4d6b-a653-7de0e4b3924f	9bca2a48-8059-48ef-82bb-6ebdf42c1240	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
28f62ed4-c20c-444a-a073-3dfaaeb9b35f	bd3f9054-c837-4b9c-a926-970181cca1ff	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
c3980fa5-f113-4e50-8b85-cb2ff57bfae2	bd3f9054-c837-4b9c-a926-970181cca1ff	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
d9f96cc2-4ba0-45ae-b760-1839c75ade51	73afe11c-f674-4897-88ea-c07e75d31407	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
44899a90-fc27-480a-9409-a661d333d0cf	73afe11c-f674-4897-88ea-c07e75d31407	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
56426fc7-9da5-44a4-95fb-38aa0fa6a809	73afe11c-f674-4897-88ea-c07e75d31407	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
a5947ddd-c1cc-4e1b-b447-1aea8aa219a5	b93dde44-301a-45b7-8516-30068bc6613a	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
9d5ebcea-916e-4724-b5c5-c259f62d4f58	b93dde44-301a-45b7-8516-30068bc6613a	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
47bba1b9-6fad-424d-ab99-b10f7cf8bcaf	b93dde44-301a-45b7-8516-30068bc6613a	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
1d6462b3-5a5b-4bcb-a688-550132536b5b	b93dde44-301a-45b7-8516-30068bc6613a	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
4f4e8c61-9745-4faf-a3a6-0e1c17212108	fc235b7e-5086-4781-a4b2-2ef9a605ac60	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
5d1f95db-1183-4b69-b98b-70796752d6d9	fc235b7e-5086-4781-a4b2-2ef9a605ac60	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
a33b7218-71cd-470a-90b1-bc74f1b512dd	fc235b7e-5086-4781-a4b2-2ef9a605ac60	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
bc04732e-0677-4f92-bcf9-490ca804eca0	9c039923-89a6-4d54-9ea4-b2fef0e9ff5a	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
c5cf3f88-ad3c-45fd-a63c-c08e3b5d5d1d	9c039923-89a6-4d54-9ea4-b2fef0e9ff5a	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
50cc0825-80cf-4613-a082-3622d1f7efc7	9c039923-89a6-4d54-9ea4-b2fef0e9ff5a	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
b3cc1078-3a1b-4438-8711-39c54c7f4440	9c039923-89a6-4d54-9ea4-b2fef0e9ff5a	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
e8f05d2f-284d-4a62-ab5f-77cd5e1b4475	f20d5ee3-6081-4a85-8867-7cd91661e24f	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
35e02d8f-f7c7-4277-9d09-177b633bd665	8a3d7344-58b6-4e69-9bc1-619ebe3a27ab	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
cba669a9-e84e-4989-be39-6fe3b11b9beb	8a3d7344-58b6-4e69-9bc1-619ebe3a27ab	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
aa00df37-7d2c-4c83-b1fa-6585beb73876	fb583514-46d1-4a8a-988b-a36ad705e1ec	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
2b96c5fe-f737-4dde-85e5-a4336e7928eb	fb583514-46d1-4a8a-988b-a36ad705e1ec	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
0479a8df-d4aa-4f56-9666-314453cafae6	15a0d47a-12f3-4209-b9ec-edefb7929566	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
761a4d3c-4d80-4762-b78a-a6fd299429af	15a0d47a-12f3-4209-b9ec-edefb7929566	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
c05d6077-d910-421b-9b4f-ab8a0ada9023	15a0d47a-12f3-4209-b9ec-edefb7929566	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
04564b5b-1852-4008-ba25-bb886ffeefd4	dbf91ce7-dbf0-4de1-a3c2-773094574e59	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
7793c22b-49bc-466f-b70d-1d22292522ed	dbf91ce7-dbf0-4de1-a3c2-773094574e59	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
5554e722-15db-4813-ada6-c3a5fec410e4	6e49ef9c-a902-43d2-83ce-26d37cc0681b	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
98d8a1d3-4341-4093-a20a-e7ec9039d28f	6e49ef9c-a902-43d2-83ce-26d37cc0681b	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
749aba0e-f140-4ada-aa38-85e5aaebdec7	70719ab4-1076-450c-ab42-acee10725b3c	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
c142a8e0-73ea-413c-a83f-b6ecfce840a9	70719ab4-1076-450c-ab42-acee10725b3c	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
8bc136a5-47e8-4446-8e31-b4038e31ee50	70719ab4-1076-450c-ab42-acee10725b3c	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
18fdb914-cee8-465d-b561-84b52f80bc50	b46f5c6e-ce88-4377-af72-fab830dda162	61f07f1f-0253-4bf8-bc0b-6674ec1c4e59	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
2114d5bc-bf62-48d0-998b-c81885c5d9f9	b46f5c6e-ce88-4377-af72-fab830dda162	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
8eb1a399-f099-403c-ba46-c78b55352996	9348e812-7f51-44f7-bada-f13551b6e5e9	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
c98d27e8-74cd-444b-9df4-039b4b15f1f9	9348e812-7f51-44f7-bada-f13551b6e5e9	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
00db9f8c-d223-4b70-8cc1-c6f7eec18e73	9348e812-7f51-44f7-bada-f13551b6e5e9	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
7a91e859-0fff-4cc6-b936-e7e17a684849	01f35759-c2ac-482e-adc8-674c2315b235	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
0baac1c1-1f09-45e1-89df-64affee01dab	01f35759-c2ac-482e-adc8-674c2315b235	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
ca3c137a-f56f-4297-b8f1-d0a029316c73	01f35759-c2ac-482e-adc8-674c2315b235	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
7db9c9e8-3099-42af-972c-d3286a47bf10	01f35759-c2ac-482e-adc8-674c2315b235	61f07f1f-0253-4bf8-bc0b-6674ec1c4e59	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
2c9da940-2fb0-4e66-b076-55b5e560cd7f	bc23c3f4-4ce4-462e-a1b3-6f2cfb4ac3c8	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
024bf2bd-97b9-4239-a6de-ae083255112f	bc23c3f4-4ce4-462e-a1b3-6f2cfb4ac3c8	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
397570f0-cb71-479b-a264-d16325302dd1	6b8cbd3a-1175-43b6-a571-e1849d9a4a2f	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
9da17431-9def-4dec-a485-c7b7c6cc9609	029e456a-60c1-4c62-96df-ab0b7715e902	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
3faee81e-6a14-423f-b03b-f49867cf4d2e	029e456a-60c1-4c62-96df-ab0b7715e902	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
a6556e3d-2694-44ce-b55f-7e19712fa507	029e456a-60c1-4c62-96df-ab0b7715e902	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
c7afd6d3-f845-4780-b65b-5b61286a06ef	b58862c3-37de-458f-84bf-606d6e8f1862	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
7f407429-0a07-42eb-b8e6-1f6435097e12	b58862c3-37de-458f-84bf-606d6e8f1862	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
df7c0d2d-525a-48d0-b4e6-15bb0690c4e1	b58862c3-37de-458f-84bf-606d6e8f1862	e7c6f4d3-775f-4192-9107-ed16a43ff785	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
033ba0a9-2d97-4f78-ba1f-fb3afa8de663	56411e79-f129-440d-838d-36518b11c57b	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
0d3be948-235b-40de-9c85-8519a75cc752	56411e79-f129-440d-838d-36518b11c57b	e7c6f4d3-775f-4192-9107-ed16a43ff785	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
470ad2a8-e7eb-402f-ab91-34152cdd7cea	56411e79-f129-440d-838d-36518b11c57b	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
e987690a-90b5-4cf7-a3e3-84234cd0adb3	c802896c-1c22-47c3-af0b-a555d942173b	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
31d605a6-ee7f-418d-a3ce-14f0aca81f7d	c802896c-1c22-47c3-af0b-a555d942173b	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
b80f7493-4d63-4acc-a361-3c22fcda7bdb	75b62d2b-8026-4743-98a9-bf2fa012262a	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
39fa2265-4506-4694-9e09-084c02b7f5c2	75b62d2b-8026-4743-98a9-bf2fa012262a	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
23770c12-2f50-4851-bef9-a4f1601908f2	1b5b5974-68e9-4910-ad3d-1f65bbc77abe	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-05 14:17:33.975672+00	\N
7ab34ea4-39e8-4549-94f2-196db117734c	ce5fadaf-3466-4cc7-8e56-0826dc527673	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-08-06 20:24:12.082882+00	38221ba4-8e24-4e9a-be66-e922784f39df
2d651e48-05f9-43e4-a63e-fb13a6dc98ff	ce5fadaf-3466-4cc7-8e56-0826dc527673	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-06 20:24:19.05717+00	b233f846-f747-4c9f-882e-c832831b1189
8a3da2ed-472d-4c42-8006-949c3f5f51bc	55e9b034-573e-4786-a7bd-bfcf195b5a10	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-11 08:07:49.059529+00	d23d0605-1ed1-47f0-b026-e756ce148388
5df6cb15-bcd3-4749-9901-2e5cfc16ba97	029e456a-60c1-4c62-96df-ab0b7715e902	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-08-11 10:29:46.523101+00	ff559e00-2055-4bb9-a452-b6ec5b40502f
91f511b3-d9c6-44e7-81ad-a6eac75634af	9bca2a48-8059-48ef-82bb-6ebdf42c1240	567e0f1d-de5e-4ed5-af1d-33b858775ad9	t	\N	\N	2026-08-05 12:22:53.273226+00	\N
9fddddc4-f57e-4865-970c-0518d95bc16e	b93dde44-301a-45b7-8516-30068bc6613a	e7c6f4d3-775f-4192-9107-ed16a43ff785	f	\N	\N	2026-08-14 01:15:53.968085+00	e7069d15-cd04-4cdf-918f-d7d1d6205ce3
a2de187f-585d-4d9c-8ecb-fbc2dbcf14ae	6e49ef9c-a902-43d2-83ce-26d37cc0681b	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-14 02:39:02.246469+00	da0a083a-4879-4486-bb6d-8f7cbe45a095
57795c97-4e4a-4b36-8cb1-48cfaa920a5a	d26b7a10-eb51-47ec-95aa-793b5254b2dd	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-14 02:57:37.568033+00	da0a083a-4879-4486-bb6d-8f7cbe45a095
66ba1da5-3d84-4c38-97fa-0ec0b5011467	d26b7a10-eb51-47ec-95aa-793b5254b2dd	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-14 02:57:40.12563+00	b233f846-f747-4c9f-882e-c832831b1189
550ea772-9808-43f6-ae00-4d5acf4f6408	ce5fadaf-3466-4cc7-8e56-0826dc527673	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-08-14 02:59:54.472444+00	fa4a6976-f1ac-4002-8f9a-8f649f9a5906
e595a51d-f614-407b-adbe-19ac15a25b5f	ce5fadaf-3466-4cc7-8e56-0826dc527673	3764122a-820e-482e-8f99-f9a92c725e30	t	\N	\N	2026-08-14 03:00:31.769674+00	decf010a-15c0-4cb3-b984-34c9f6f467c8
b3a2fcdd-3813-4c26-8978-e4942c6232ca	396d3a16-874d-4873-b0f9-f5a8fa87082e	69a3ed3a-4573-4bfa-8fe2-85f348229474	t	\N	\N	2026-08-14 07:54:48.916069+00	aaa55757-3029-428d-977c-d02d94ebe5f5
03564dd6-d21e-4ae7-9af0-fc306d586194	396d3a16-874d-4873-b0f9-f5a8fa87082e	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-14 07:54:51.465783+00	d23d0605-1ed1-47f0-b026-e756ce148388
78c7d4a1-326f-44f3-9239-ad37a25677ae	859a0cd5-41ff-427e-af00-7b91a5ccc48f	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-14 07:57:51.364368+00	d23d0605-1ed1-47f0-b026-e756ce148388
28646d44-a951-4de8-a736-dd6e965c5d20	a5c24499-358b-4cb0-a444-9165752b7eae	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-08-14 07:58:50.957117+00	06008da0-23e9-4dcb-964c-d067a98d4993
f7df6dfe-cf59-4e42-ada1-06698dcb392d	a5c24499-358b-4cb0-a444-9165752b7eae	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-08-14 07:58:52.484938+00	d87ef01c-8445-4e88-8a9d-b01d52bab1b8
cdbab967-7d39-48bd-a0f3-446712b28369	a5c24499-358b-4cb0-a444-9165752b7eae	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-08-14 07:58:54.454723+00	08c60a84-ab49-47a9-863d-22b96adadcbb
3efbca1d-0e08-427f-9804-b330117b3ce1	bc2b5e29-3e36-46ac-9be4-4670964c9c92	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-19 18:11:19.274413+00	d23d0605-1ed1-47f0-b026-e756ce148388
1a304e74-4a4c-40a3-9b18-8656b7c144fb	d6dfecca-c973-4e1c-b5f3-e512b62cdaeb	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-08-27 01:43:27.734812+00	d23d0605-1ed1-47f0-b026-e756ce148388
5e6476ec-1b00-4073-97b5-c7653ad9e757	d6dfecca-c973-4e1c-b5f3-e512b62cdaeb	44b4db59-f10f-46f1-bef8-00281362f176	t	\N	\N	2026-08-27 01:43:28.406934+00	7eb58bb4-32bd-44af-b242-2a3c131300e7
3c00580b-8857-40c9-b253-3f542c4eb383	219d920e-baa5-48a8-be49-43b1ead38c2d	dfacaba3-5894-4f9c-86e3-24e27cf140e6	t	\N	\N	2026-08-27 01:43:37.592977+00	8a64408d-dc2c-4dee-93c3-95745982e428
c13c8d83-f555-4cef-96cc-1d40fa349967	219d920e-baa5-48a8-be49-43b1ead38c2d	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-08-27 01:43:38.807942+00	06008da0-23e9-4dcb-964c-d067a98d4993
b54b6100-447f-4ed0-af65-5612eaa5872b	219d920e-baa5-48a8-be49-43b1ead38c2d	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-08-27 01:43:41.355853+00	7243cbce-8de4-45e1-a64f-30bd2475d68b
dbbe547f-21c4-48a8-8b93-e49f32e355dd	5a78213d-d6cd-44bd-862a-78de64a47390	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-09-03 03:45:08.190166+00	99a8e797-72ff-4cee-b9bc-86b79924866e
d7693f56-b03b-4d72-abb9-26d26bc7092b	5a78213d-d6cd-44bd-862a-78de64a47390	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-09-03 03:52:29.163304+00	06008da0-23e9-4dcb-964c-d067a98d4993
117b02ea-c6df-4997-a615-eb3a0322da50	5a78213d-d6cd-44bd-862a-78de64a47390	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-09-03 03:52:30.803868+00	d87ef01c-8445-4e88-8a9d-b01d52bab1b8
7b613f25-6ccc-4ce1-b68a-30ec803de917	a1e72b18-633e-4c54-bc57-5d600f997b1c	646b514e-4ba0-4ce3-bc5f-b48f8e9d9a0d	t	\N	\N	2026-09-03 03:56:28.850718+00	d87ef01c-8445-4e88-8a9d-b01d52bab1b8
d2a0ea21-6efe-4d61-a831-0a3e7fed1592	219d920e-baa5-48a8-be49-43b1ead38c2d	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-09-03 04:58:14.817347+00	24e38d6c-4e27-4ccb-be22-f4f463eb1ad9
e98bb17b-a7e6-40bd-830e-2a7750769e5d	5a78213d-d6cd-44bd-862a-78de64a47390	dfacaba3-5894-4f9c-86e3-24e27cf140e6	t	\N	\N	2026-09-03 04:58:40.354291+00	a0102cf5-5e59-47a0-b485-4176c67c9154
06fbf2e4-9d75-4a40-9c78-00e26806ba6b	1f12ee33-6343-4fdb-9305-348e0851d5ec	5eef36c4-019f-466f-bff6-4b55ae37c844	t	\N	\N	2026-09-21 16:43:28.97341+00	27ac3cac-37b0-4be0-8622-77248d69f5b8
d8fd9431-b7c6-43a9-8dac-db66d8b4c91c	1f12ee33-6343-4fdb-9305-348e0851d5ec	5ee27aa9-9716-4346-a3c3-58c02f10a3a9	t	\N	\N	2026-09-21 16:43:31.405501+00	0689023a-df0e-4a6a-9b66-da453529ddac
73d3a09d-8250-47cc-b37e-fffc2b6044c7	1f12ee33-6343-4fdb-9305-348e0851d5ec	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-09-21 16:43:37.861158+00	99a8e797-72ff-4cee-b9bc-86b79924866e
1524805b-9d39-47dd-bac5-09f7453db505	bd0380f5-02a4-4b56-97e2-432d7e7b1aed	852a84ca-7480-40ed-a829-1efd76983bf9	t	\N	\N	2026-09-21 17:25:55.154385+00	ae77281c-c1af-4be1-9e36-aacf0f2851f9
73a6c6f3-cc76-4457-b2a0-b13578101f72	bd0380f5-02a4-4b56-97e2-432d7e7b1aed	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-09-21 17:25:56.576171+00	d23d0605-1ed1-47f0-b026-e756ce148388
537478e2-acbe-43ca-aeef-b6b6ba918433	3e499a93-7a98-49e3-b19f-3a347d570f60	3020391d-6073-47d9-af17-38c1aa3a07c1	t	\N	\N	2026-09-21 17:29:39.521944+00	6dbaf9b4-a55c-4a2d-8767-e65b4eb5a048
664b041f-0147-4022-bf5e-4944624a0349	3e499a93-7a98-49e3-b19f-3a347d570f60	dfacaba3-5894-4f9c-86e3-24e27cf140e6	t	\N	\N	2026-09-21 17:29:42.553336+00	eaa1a668-aac2-4b39-b4a9-fcc6db7959de
0c46a941-1a81-4e1a-8869-aace577ebdbd	3e499a93-7a98-49e3-b19f-3a347d570f60	5eef36c4-019f-466f-bff6-4b55ae37c844	t	\N	\N	2026-09-21 17:29:45.933137+00	27ac3cac-37b0-4be0-8622-77248d69f5b8
278abd51-981b-4f7d-9e4b-ee983e96de9a	3e499a93-7a98-49e3-b19f-3a347d570f60	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-09-21 17:29:48.188557+00	0adaeb78-41fa-4e18-bc62-6b50a0adaa26
b2a4a96b-a1c4-4fd9-8ca9-bbd8254ac554	3e499a93-7a98-49e3-b19f-3a347d570f60	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-09-21 17:29:50.435871+00	df99eb4c-06f8-472c-af29-959c4e65d70e
a82a27dc-bc90-4637-a0fa-4d6d038822de	3e499a93-7a98-49e3-b19f-3a347d570f60	1ef177b0-aec5-4144-b24d-24daec5472d5	t	\N	\N	2026-09-21 17:29:53.060592+00	99a8e797-72ff-4cee-b9bc-86b79924866e
239e2a2c-5f15-4d53-9c10-2e0b43269383	21d1e0de-4e99-4230-a27e-c53a7acf0a5f	c3689ce5-1f54-4230-bdf4-055a42e95469	t	\N	\N	2026-09-22 03:45:34.823445+00	7d91e37a-5b75-4c32-8258-6c112071d5d3
791748a0-d208-496a-a5ee-ecca2186c19d	57ffbe62-de76-4cea-994c-5e6d1287efff	3020391d-6073-47d9-af17-38c1aa3a07c1	t	\N	\N	2026-09-23 22:42:41.923977+00	f2b09a7c-765a-4fb1-9c23-0b43c1640634
d65dced6-8e1c-452c-86f9-62dcbaf0027e	57ffbe62-de76-4cea-994c-5e6d1287efff	dfacaba3-5894-4f9c-86e3-24e27cf140e6	t	\N	\N	2026-09-23 22:42:43.336244+00	eaa1a668-aac2-4b39-b4a9-fcc6db7959de
86e68f89-1316-4b5f-b6ef-15a6a64e76ab	57ffbe62-de76-4cea-994c-5e6d1287efff	a5a0f701-d915-4018-975d-cf1c4080f6a0	t	\N	\N	2026-09-23 22:42:46.342602+00	0adaeb78-41fa-4e18-bc62-6b50a0adaa26
e58bd0a0-3ee5-47ea-bc63-513268adf981	57ffbe62-de76-4cea-994c-5e6d1287efff	f26b7b68-7731-4685-a0b8-4317f2ab9815	t	\N	\N	2026-09-23 22:42:50.097973+00	df99eb4c-06f8-472c-af29-959c4e65d70e
\.


--
-- Data for Name: legal_terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."legal_terms" ("id", "term_type", "version", "title", "paragraphs", "is_active", "created_at", "updated_at") FROM stdin;
2a58fa18-7ea6-4532-98a6-a6bf2313e90d	fialn_student_registration	v1.0	Termo de Ciência & Consentimento de Participação	["Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.", "Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.", "Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.", "Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes."]	t	2026-09-10 07:41:08.754836+00	2026-09-10 07:41:08.754836+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "full_name", "role", "created_at") FROM stdin;
7c09300d-d6be-41b1-aebe-3d856ac971dc	Marina Abramo	clerk	2026-08-04 04:02:53.724204+00
d25b6046-8cd6-48e5-b8f2-78373bc1818c	Leo Zerino	admin	2026-07-24 07:55:15.336979+00
532b3f7a-5968-47e6-89db-562abb75fc84	Maia	associate	2026-08-06 22:39:27.058782+00
aa61599b-fd8d-4c87-9e7a-14874579dcb7	Mariana Rodeso	associate	2026-08-03 21:33:11.762661+00
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status", "lifecycle_configuration", "lifecycle_configuration_generation") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 458, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict wN5ALmLR07qazmCzUk6UWld4u2hibiEIqVYACxh2NzuPMzc5VZ8McXD6RkA5WgC

RESET ALL;
