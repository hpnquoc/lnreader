import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator } from "react-native";

import { ProgressBar } from "react-native-paper";
import { useSelector } from "react-redux";

import { Searchbar } from "../../../Components/Searchbar";
import EmptyView from "../../../Components/EmptyView";

import { ScreenContainer } from "../../../Components/Common";
import GlobalSearchSourceItem from "./GlobalSearchSourceItem";

import { showToast } from "../../../Hooks/showToast";
import { useLibrary, useTheme } from "../../../Hooks/reduxHooks";
import { getSource } from "../../../sources/sources";

const GlobalSearch = ({ route, navigation }) => {
    const theme = useTheme();

    let novelName = "";
    if (route.params) {
        novelName = route.params.novelName;
    }

    const { sources, pinned } = useSelector((state) => state.sourceReducer);
    const pinnedSources = sources.filter(
        (source) => pinned.indexOf(source.sourceId) !== -1
    );

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState(novelName);
    const [searchResults, setSearchResults] = useState([]);
    const [progress, setProgress] = useState(0);

    const library = useLibrary();

    useEffect(() => {
        novelName && onSubmitEditing();
    }, []);

    const clearSearchbar = () => setSearchText("");
    const onChangeText = (text) => setSearchText(text);

    const onSubmitEditing = async () => {
        setSearchResults([]);

        pinnedSources.map((item, index) =>
            setTimeout(async () => {
                try {
                    setLoading(true);

                    const source = getSource(item.sourceId);
                    const data = await source.searchNovels(searchText);

                    setSearchResults((searchResults) => [
                        ...searchResults,
                        {
                            sourceId: item.sourceId,
                            sourceName: item.sourceName,
                            sourceLanguage: item.sourceLanguage,
                            novels: data,
                        },
                    ]);
                    setLoading(false);
                } catch (error) {
                    showToast(error.message);
                    setSearchResults((searchResults) => [
                        ...searchResults,
                        {
                            sourceId: item.sourceId,
                            sourceName: item.sourceName,
                            sourceLanguage: item.sourceLanguage,
                            novels: [],
                        },
                    ]);
                    setLoading(false);
                }
            }, 1000 * index)
        );
    };

    const renderItem = ({ item }) => (
        <GlobalSearchSourceItem
            source={item}
            library={library}
            theme={theme}
            navigation={navigation}
        />
    );

    return (
        <ScreenContainer theme={theme}>
            <Searchbar
                theme={theme}
                placeholder="Global Search"
                backAction="arrow-left"
                onBackAction={navigation.goBack}
                searchText={searchText}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                clearSearchbar={clearSearchbar}
            />
            {progress < 1 && progress > 0 && pinned && (
                <ProgressBar
                    color={
                        progress > 0.9
                            ? theme.colorPrimaryDark
                            : theme.colorAccent
                    }
                    progress={progress}
                />
            )}
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 4,
                }}
                data={searchResults}
                keyExtractor={(item) => item.sourceId.toString()}
                renderItem={renderItem}
                extraData={pinned}
                ListEmptyComponent={
                    <>
                        {!loading && (
                            <EmptyView
                                icon="__φ(．．)"
                                description={`Search a novel in your pinned sources ${
                                    pinned.length === 0
                                        ? "(No sources pinned)"
                                        : ""
                                }`}
                            />
                        )}
                    </>
                }
                ListFooterComponent={
                    loading && (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                padding: 16,
                            }}
                        >
                            <ActivityIndicator
                                size="large"
                                color={theme.colorAccent}
                            />
                        </View>
                    )
                }
            />
        </ScreenContainer>
    );
};

export default GlobalSearch;

const styles = StyleSheet.create({});
