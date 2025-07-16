'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackGroudAppFront } from '../../../../components/layout';
import { HeartPlus, Search } from 'lucide-react';

interface Quote {
  id: string;
  qoute: string;
  votesPoint?: number;
  userId?: string;
  updatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}
const QUOTES_PER_PAGE = 6;
const MainPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('updatedAt_desc');
  const [showVoteConfirmModal, setShowVoteConfirmModal] = useState(false);
  const [voteQuoteId, setVoteQuoteId] = useState<string | null>(null);
  const [quotesToShow, setQuotesToShow] = useState<number>(QUOTES_PER_PAGE);
  const [filterVotes, setFilterVotes] = useState<string>('all');



  const router = useRouter();

  const fetchAndProcessQuotes = async () => {
    setLoading(true);
    setError(null);

    const user_access_token = localStorage.getItem('user_access_token');

    if (!user_access_token) {
      setError('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/qoute', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user_access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: Quote[] = await response.json();

      let processedData = data;
      if (searchKey.trim()) {
        processedData = processedData.filter(quote =>
          quote.qoute.toLowerCase().includes(searchKey.toLowerCase())
        );
      }

      if (filterVotes === 'zero') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) === 0);
      } else if (filterVotes === 'greaterThanZero') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) > 0);
      } else if (filterVotes === 'greaterThanTwo') {
        processedData = processedData.filter(quote => (quote.votesPoint || 0) > 2);
      }

      const getTimestamp = (item: Quote): number => {
        if (!item.updatedAt) return 0;

        if (typeof item.updatedAt === 'object' && item.updatedAt.seconds) {
          return item.updatedAt.seconds * 1000;
        }

        if (typeof item.updatedAt === 'string') {
          return new Date(item.updatedAt).getTime();
        }

        if (item.updatedAt instanceof Date) {
          return item.updatedAt.getTime();
        }

        if (typeof item.updatedAt === 'number') {
          return item.updatedAt;
        }

        return 0;
      };

      processedData.sort((a: Quote, b: Quote) => {
        if (sortOrder === 'votesPoint_desc') {
          return (b.votesPoint || 0) - (a.votesPoint || 0);
        }
        else if (sortOrder === 'updatedAt_asc') {
          const timeA = getTimestamp(a);
          const timeB = getTimestamp(b);

          return timeA - timeB;
        }
        else if (sortOrder === 'updatedAt_desc') {
          const timeA = getTimestamp(a);
          const timeB = getTimestamp(b);

          return timeB - timeA;
        }
        return 0;
      });

      setQuotesToShow(QUOTES_PER_PAGE);
      setQuotes(processedData);
      console.log("Process Data : ", processedData);
    } catch (err: any) {
      console.error('Error fetching quotes:', err);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล Quote: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessQuotes();
  }, [sortOrder, filterVotes]);

  const handleVote = (quoteId: string) => {
    setVoteQuoteId(quoteId);
    setShowVoteConfirmModal(true);
  };

  const handleCancelVote = () => {
    setShowVoteConfirmModal(false);
    setVoteQuoteId(null);
  };

  const handleConfirmVote = async () => {
    if (!voteQuoteId) return;
    const user_access_token = localStorage.getItem('user_access_token');
    if (!user_access_token) {
      alert('ไม่พบ Access Token กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/qoute/vote/${voteQuoteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user_access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'เกิดข้อผิดพลาดในการโหวต');
      }
      setShowVoteConfirmModal(false);
      setVoteQuoteId(null);
      fetchAndProcessQuotes();
      alert('โหวตสำเร็จ!');
    } catch (err: any) {
      setShowVoteConfirmModal(false);
      setVoteQuoteId(null);
      alert('คุณได้ทำการโหวตคำคมไปแล้ว : 1 ผู้ใช้สามารถโหวตได้เพียง 1 คำคมเท่านั้น');
    }
  };

  const handleSearchClick = () => {
    fetchAndProcessQuotes();
  };

  const handleLoadMore = () => {
    setQuotesToShow(prevCount => prevCount + QUOTES_PER_PAGE + 5);
  };

  const handleShowLess = () => {
    setQuotesToShow(QUOTES_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">กำลังโหลดรายการ Quote...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
        <p className="text-xl text-red-700">ข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  const hasMoreQuotes = quotesToShow < quotes.length;

  return (
    <BackGroudAppFront>
      <div className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-9">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          รายการ คำคม
        </h1>

        <div className="mb-6 border-b pb-4 border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4 flex-grow">
              <div className="flex-1">
                <label htmlFor="search-key" className="block text-sm font-medium text-gray-700 mb-1">
                  ระบุคำค้นหา
                </label>
                <input
                  id="search-key"
                  type="text"
                  placeholder="เพิ่มคีย์เวิร์ด (Keyword)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 text-gray-700"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>

              <div className="flex-1 md:flex-none md:w-48">
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                  เรียงลำดับ
                </label>
                <select
                  id="sort-order"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="updatedAt_desc">เรียงลำดับใหม่ - เก่า</option>
                  <option value="updatedAt_asc">เรียงลำดับเก่า - ใหม่</option>
                  <option value="votesPoint_desc">คะแนนโหวต (สูงสุด)</option>
                </select>
              </div>

              <div className="flex-1 md:flex-none md:w-48">
                <label htmlFor="filter-votes" className="block text-sm font-medium text-gray-700 mb-1">
                  กรองข้อมูล
                </label>
                <select
                  id="filter-votes"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={filterVotes}
                  onChange={(e) => setFilterVotes(e.target.value)}
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="zero">คะแนนโหวต = 0</option>
                  <option value="greaterThanZero">คะแนนโหวต {'>'} 0</option>
                  <option value="greaterThanTwo">คะแนนโหวต {'>'} 2</option>
                </select>
              </div>

              <div className="md:self-end">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  ค้นหา
                </button>
              </div>
            </div>
          </div>
        </div>

        {quotes.length === 0 ? (
          <p className="text-center text-gray-600">ไม่พบคำคมใดๆ</p>
        ) : (
          <div className="space-y-4">
            {quotes.slice(0, quotesToShow).map((quote) => (
              <div key={quote.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-start justify-between">
                <div className="flex-grow pr-4 max-w-[calc(100%-80px)]">
                  <p className="text-gray-800 text-lg mb-2 leading-relaxed break-words">
                    "{quote.qoute}"
                  </p>
                  {quote.votesPoint !== undefined && (
                    <p className="text-gray-600 text-sm italic mt-1">
                      คะแนนโหวต: <span className="font-bold text-blue-600">{quote.votesPoint}</span>
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 items-center flex-shrink-0">
                  <button
                    onClick={() => handleVote(quote.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    title="โหวต Quote"
                  >
                    <HeartPlus className="w-6 h-6" color='#000000' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {quotes.length > QUOTES_PER_PAGE && (
          <div className="flex justify-center mt-6">
            {hasMoreQuotes ? (
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-amber-500 text-white rounded-md shadow-md hover:bg-amber-600 transition-colors duration-200"
              >
                แสดง Quote เพิ่มเติม ({quotes.length - quotesToShow} รายการ)
              </button>
            ) : (
              <button
                onClick={handleShowLess}
                className="px-6 py-3 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition-colors duration-200"
              >
                แสดงน้อยลง
              </button>
            )}
          </div>
        )}

        {showVoteConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-gray-700/60">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md min-w-[400px] text-center">
              <h2 className="text-xl font-bold text-black mb-4">ยืนยันการโหวต</h2>
              <p className="mb-6 text-black">1 ผู้ใช้สามารถโหวตได้เพียง 1 บทความเท่านั้น<br />คุณต้องการโหวตบทความนี้ใช่หรือไม่?</p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleCancelVote}
                  className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  ไม่
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVote}
                  className="px-5 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-200"
                >
                  ใช่
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackGroudAppFront>
  );
};

export default MainPage;
