# AkariOps PRD

## Product Summary

AkariOps is a browser-based AI troubleshooting assistant for store hardware and operational systems. The experience is guided by an original persona named Akari that feels like a fast field operator for retail support.

## Challenge Fit

- AI is central to the product, not a chatbot add-on
- The product has a strong character identity
- The app is designed for browser use and Vercel deployment
- The use case is distinct from generic chat applications

## Users

- Store operators
- Cashiers
- Retail support staff
- Small business owners managing POS devices

## Problem

When a scanner, printer, POS terminal, or network flow breaks, users usually do not know:

- what category the issue belongs to
- what the likely cause is
- what to test first
- when to stop trying and escalate

## Product Goal

Guide a user from symptom intake to structured diagnosis to escalation with a clear AI-led workflow.

## MVP Scope

1. Landing page with clear brand identity
2. Diagnosis workspace with issue category selection
3. AI-generated structured diagnosis
4. Step-by-step troubleshooting guide
5. AI-generated handoff summary
6. Local session history

## AI Responsibilities

- classify issue type
- estimate severity
- list probable causes
- generate ordered troubleshooting steps
- decide if escalation is needed
- generate a human-readable handoff summary

## Success Criteria

- user can start a session in under 10 seconds
- AI returns structured JSON, not only prose
- summary page produces a support-ready case brief
- the app can be deployed to Vercel without backend coupling
