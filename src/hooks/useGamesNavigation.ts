import { useState } from 'react'
import { useSearchParams } from 'react-router'

const minSearchTextLength = 2
const defaultOrderBy = "default"
const pageParam = "page"
const orderByParam = "orderBy"
const searchTextParam = "search"
const genreParam = "genre"
const developerParam = "developer"
const publisherParam = "publisher"

const defaultNavigation = {
  pageSize: 24,
  page: 1,
  orderBy: defaultOrderBy,
  searchText: "",
  genre: 0,
  developer: 0,
  publisher: 0
}

interface INavigation {
  pageSize: number
  page: number
  orderBy: string
  searchText: string
  genre: number
  developer: number
  publisher: number
}

const useGamesNavigation = () => {
  let [searchParams, setSearchParams] = useSearchParams()

  const [navigation, setNavigation] = useState<INavigation>(() => {
    const pageSize = defaultNavigation.pageSize
    const pageP = parseInt(searchParams.get(pageParam) || "")
    const page = pageP >= defaultNavigation.page
      ? pageP
      : defaultNavigation.page
    const orderByP = searchParams.get(orderByParam) || ""
    const orderBy = orderByP && orderByP !== defaultOrderBy
      ? orderByP
      : defaultNavigation.orderBy
    const searchTextP = searchParams.get(searchTextParam) || ""
    const searchText = searchTextP.length >= minSearchTextLength
      ? searchTextP
      : defaultNavigation.searchText
    const genreP = parseInt(searchParams.get(genreParam) || "")
    const genre = genreP || defaultNavigation.genre
    const developerP = parseInt(searchParams.get(developerParam) || "")
    const developer = developerP || defaultNavigation.developer
    const publisherP = parseInt(searchParams.get(publisherParam) || "")
    const publisher = publisherP || defaultNavigation.publisher

    return {
      pageSize: pageSize,
      page: page,
      orderBy: orderBy,
      searchText: searchText,
      genre: genre,
      developer: developer,
      publisher: publisher,
    }
  })

  const pagesCount = (count: number) => Math.ceil(count / navigation.pageSize)

  const handleSorting = (event: React.MouseEvent<HTMLElement>, orderBy: string | null) => {
    if (orderBy) {
      setNavigation(p => ({
        ...p,
        page: defaultNavigation.page,
        orderBy: orderBy
      }))
      setSearchParams(p => {
        p.delete(pageParam)
        if (orderBy === defaultOrderBy) {
          p.delete(orderByParam)
        } else {
          p.set(orderByParam, orderBy)
        }
        return p
      })
    }
  }

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const text = e.target.value
    setNavigation(p => ({
      ...p,
      page: text.length >= minSearchTextLength ? defaultNavigation.page : p.page,
      searchText: text
    }))
    setSearchParams(p => {
      p.delete(pageParam)
      if (text.length >= minSearchTextLength) {
        p.set(searchTextParam, text)
      } else {
        p.delete(searchTextParam)
      }
      return p
    })
  }

  const handleCategoryChange = (type: "genre" | "publisher" | "developer", id: number) => {
    if (id) {
      if (id === navigation[type]) {
        id = 0
      }
      setNavigation(p => ({
        ...p,
        page: defaultNavigation.page,
        [type]: id
      }))
    }
    setSearchParams(p => {
      p.delete(pageParam)
      if (id && id !== navigation[type]) {
        p.set(type, id.toString())
      } else {
        p.delete(type)
      }
      return p
    })
  }

  const handleNavigation = (page: number = defaultNavigation.page) => {
    setNavigation(p => ({
      ...p,
      page: page
    }))
    setSearchParams(p => {
      p.set(pageParam, page.toString())
      return p
    })
  }

  const resetToFirstPage = () => {
    setNavigation(p => ({
      ...p,
      page: defaultNavigation.page
    }))
    setSearchParams(p => {
      p.delete(pageParam)
      return p
    })
  }

  return {
    navigation,
    defaultNavigation,
    pagesCount,
    handleSorting,
    handleSearchTextChange,
    handleCategoryChange,
    handleNavigation,
    resetToFirstPage
  }
}

export default useGamesNavigation
