import json
import os
from typing import List, Dict
from google.oauth2 import service_account
from googleapiclient.discovery import build


def read_tickets(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_service(creds_info: dict):
    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    credentials = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=scopes,
    )
    return build("sheets", "v4", credentials=credentials)


def format_ticket_rows(tickets: List[Dict]) -> List[List[str]]:
    header = [
        "Name",
        "Type",
        "Status",
        "Priority",
        "Product Area",
        "Platform",
        "Location",
        "Submitter",
        "Client",
        "Start Date",
        "Last Updated",
        "PMR #",
        "PMG #",
        "CPM #",
        "FP Ticket Number",
        "Ticket Thread ID",
        "Summary",
        "Details",
        "Activity"
    ]

    rows = [header]

    for t in tickets:
        rows.append([
            t.get("name", ""),
            t.get("type", ""),
            t.get("status", ""),
            t.get("priority", ""),
            t.get("productArea", ""),
            t.get("platform", ""),
            t.get("location", ""),
            t.get("submitter", ""),
            t.get("client", ""),
            t.get("startDate", ""),
            t.get("lastUpdated", ""),
            t.get("pmrNumber", ""),
            t.get("pmgNumber", ""),
            t.get("cpmNumber", ""),
            t.get("fpTicketNumber", ""),
            t.get("ticketThreadId", ""),
            t.get("summary", ""),
            t.get("details", ""),
            t.get("activity", "")
        ])

    return rows


def update_sheet(service, sheet_id: str, tab_name: str, values: List[List[str]]):
    clear_range = f"{tab_name}!A:Z"
    service.spreadsheets().values().clear(
        spreadsheetId=sheet_id,
        range=clear_range,
        body={}
    ).execute()

    write_range = f"{tab_name}!A1"
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=write_range,
        valueInputOption="RAW",
        body={"values": values}
    ).execute()


def main():
    sheet_id = os.environ["GOOGLE_SHEET_ID"]
    tab_name = os.environ.get("GOOGLE_SHEET_TAB_NAME", "Tickets")
    creds_json = os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"]

    creds_info = json.loads(creds_json)
    service = get_service(creds_info)

    tickets = read_tickets("tickets.json")
    values = format_ticket_rows(tickets)

    update_sheet(service, sheet_id, tab_name, values)
    print("Sheet updated successfully.")


if __name__ == "__main__":
    main()
