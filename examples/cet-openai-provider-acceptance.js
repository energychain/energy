#!/usr/bin/env node
/**
 * Public-safe Beispiel: synthetische OpenAI-kompatible Provider-Antworten
 * lokal gegen einen kleinen Abnahmevertrag prüfen.
 *
 * Kein Netzwerkzugriff, kein Token, keine echten Prompts oder Kundendaten.
 */

const fixture = {
  models: {
    object: "list",
    data: [
      { id: "synthetic-energy-model", object: "model" }
    ]
  },
  completion: {
    id: "synthetic-chatcmpl-001",
    object: "chat.completion",
    model: "synthetic-energy-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Eine synthetische Testantwort mit klar benannter Evidenzgrenze."
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: 12,
      completion_tokens: 9,
      total_tokens: 21
    }
  }
};

function check(condition, code, detail) {
  return { code, ok: Boolean(condition), detail };
}

function reviewProviderFixture(input) {
  const modelIds = Array.isArray(input.models?.data)
    ? input.models.data.map((item) => item.id).filter(Boolean)
    : [];
  const choice = input.completion?.choices?.[0];
  const content = choice?.message?.content;
  const usage = input.completion?.usage;

  const checks = [
    check(input.models?.object === "list", "model_list_envelope", "models.object ist list"),
    check(modelIds.length > 0, "model_id_present", "mindestens eine Modell-ID ist vorhanden"),
    check(input.completion?.object === "chat.completion", "completion_envelope", "completion.object ist chat.completion"),
    check(modelIds.includes(input.completion?.model), "model_reference_known", "Antwortmodell steht in der Modellliste"),
    check(choice?.message?.role === "assistant", "assistant_role", "erste Choice enthält eine Assistant-Nachricht"),
    check(typeof content === "string" && content.trim().length > 0, "content_present", "Antwortinhalt ist nicht leer"),
    check(choice?.finish_reason === "stop", "finish_reason_visible", "Abschlussgrund ist sichtbar"),
    check(Number.isInteger(usage?.total_tokens) && usage.total_tokens >= 0, "usage_shape", "Token-Nutzung ist als nichtnegative Ganzzahl dokumentiert")
  ];

  return {
    mode: "cet-openai-provider-acceptance",
    sourceClass: "synthetic-local-fixture",
    networkCalls: 0,
    tokenRequired: false,
    passed: checks.every((item) => item.ok),
    checks,
    noActionBoundary: [
      "Der Test prüft nur die Form synthetischer Antworten.",
      "Er bewertet weder Fachrichtigkeit noch Datenschutz, SLA, Preis oder Produktivreife.",
      "Ein echter Endpoint-Test benötigt einen ausdrücklich erlaubten Testkontext."
    ]
  };
}

const result = reviewProviderFixture(fixture);
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
