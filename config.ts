import * as dotenv from "dotenv";
dotenv.config();

class Config {
    openai_api_key: string = "";
    have_openai_api_key: boolean = false;
    have_model: boolean = false;
    llm_name: string = "gpt-4.1-mini";
    amadeus_bearer_token: string = "";
    have_amadeus_bearer_token: boolean = false;
    amadeus_url: string = "";
    have_amadeus_url: boolean = false;
    nutrition_url: string = "";
    have_nutrition_url: boolean = false;
    telegram_bot_token: string = "";
    have_telegram_bot_token: boolean = false;
    telegram_sales_chat_id: string = "";
    have_telegram_sales_chat_id: boolean = false;
    azure_storage_connection_string: string = "";
    have_azure_storage_connection_string: boolean = false;
    azure_leads_table_name: string = "";
    have_azure_leads_table_name: boolean = false;
    azure_conversations_table_name: string = "";
    have_azure_conversations_table_name: boolean = false;

    constructor() {
        this.init();
    }

    populate(name: string): string {
        return process.env[name] || "";
    }

    apiKeyExists(name: string): boolean {
        return this.populate(name) !== "";
    }

    init() {
        this.have_openai_api_key = this.apiKeyExists("OPENAI_API_KEY");
        this.have_model = this.apiKeyExists("LLM_NAME");
        this.openai_api_key = this.populate("OPENAI_API_KEY");
        this.llm_name = this.populate("LLM_NAME");
        this.have_amadeus_bearer_token = this.apiKeyExists("AMADEUS_BEARER_TOKEN");
        this.amadeus_bearer_token = this.populate("AMADEUS_BEARER_TOKEN");
        this.have_amadeus_url = this.apiKeyExists("AMADEUS_URL");
        this.amadeus_url = this.populate("AMADEUS_URL");
        this.have_nutrition_url = this.apiKeyExists("NUTRITION_URL");
        this.nutrition_url = this.populate("NUTRITION_URL");
        this.have_telegram_bot_token = this.apiKeyExists("TELEGRAM_BOT_TOKEN");
        this.telegram_bot_token = this.populate("TELEGRAM_BOT_TOKEN");
        this.have_telegram_sales_chat_id = this.apiKeyExists("TELEGRAM_SALES_CHAT_ID");
        this.telegram_sales_chat_id = this.populate("TELEGRAM_SALES_CHAT_ID");
        this.have_azure_storage_connection_string = this.apiKeyExists("AZURE_STORAGE_CONNECTION_STRING");
        this.azure_storage_connection_string = this.populate("AZURE_STORAGE_CONNECTION_STRING");
        this.have_azure_leads_table_name = this.apiKeyExists("AZURE_LEADS_TABLE_NAME");
        this.azure_leads_table_name = this.populate("AZURE_LEADS_TABLE_NAME");
        this.have_azure_conversations_table_name = this.apiKeyExists("AZURE_CONVERSATIONS_TABLE_NAME");
        this.azure_conversations_table_name = this.populate("AZURE_CONVERSATIONS_TABLE_NAME");
    }
}

export const config = new Config();