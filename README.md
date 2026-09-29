# WhatsApp Wrapped App

React Native application that analyzes exported WhatsApp chats locally and transforms conversation data into a story-style statistics experience.

The app can import WhatsApp chat exports in `.txt` or `.zip` format, process the messages directly on the device and generate statistics without requiring a backend.

## Key Features

- Import WhatsApp chat exports from `.txt` files
- Import `.zip` exports and automatically extract the chat file
- Count total messages
- Compare message activity between two participants
- Count shared links
- Identify the most active month
- Identify the most active hour
- Calculate average messages per day
- Detect the most used emoji
- Display statistics using a story-style interface
- Local file processing without a backend

## Tech Stack

- React Native
- TypeScript
- React Navigation
- React Native FS
- React Native ZIP Archive
- React Native Blob Util
- React Native SVG
- React Native Linear Gradient

## How It Works

1. The user selects an exported WhatsApp `.txt` or `.zip` file.
2. If a ZIP file is selected, the application extracts the contained chat file.
3. The application parses message dates, participants and message content locally.
4. Conversation statistics are calculated.
5. Results are displayed through an interactive story-style interface.

## Current Limitations

- The current parser is designed primarily for chats with two participants.
- The parser expects a specific WhatsApp export date and time format.
- Different regional export formats may require parser adjustments.

## Privacy

Chat files are processed locally by the application. The current implementation does not require a backend to analyze conversation data.